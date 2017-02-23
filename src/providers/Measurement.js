const _ = require('underscore')
const Promise = require('bluebird')
const BaseProvider = require('./Base')
const MeasurementFilterModel = require('../models/MeasurementFilter')
const MeasurementListModel = require('../models/MeasurementList')
const fields = require('../config/fields')

class MeasurementProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._MeasurementFilterModel = MeasurementFilterModel
		this._MeasurementListModel = MeasurementListModel
		this._fields = fields
	}

	findByFilter (filter) {
		return new Promise((resolve, reject) => {
			if ( ! (filter instanceof this._MeasurementFilterModel)) {
				return reject('Invalid measurement filter.')
			}

			var deviceIDs = filter.getAllDeviceIDs()

			if (deviceIDs.length === 0) {
				return resolve(this._createModel(filter))
			}

			this._getProvider('device').find({ id: deviceIDs })
				.then((devices) => (
					Promise.all(devices.map((device) => device.loadTemplate()))
						.then(() => devices.map((device) => device.get('template').get('attributes')))
				))
				.then((attributes) => {
					// Check if all devices support requested fields
					var uncommon = (attributes.length > 1 ? _.difference(...attributes) : [])
					var unsupported = []

					_.pluck(filter.getFields(), 'name').forEach((name) => {
						if (uncommon.indexOf(name) === -1) return
						unsupported.push(name)
					})

					if (unsupported.length > 0) {
						throw new Error('Fields not supported by all devices: ' + unsupported.join(', '))
					}
				})
				.then(() => {
					// Determine if all requested fields are supported and create column SELECT SQL queries
					var columns = []
					var selects = []

					filter.getFields().forEach(({ name, column, aggregator }) => {
						if ( ! this._fields[name]) {
							throw new Error(`Field "${name}" not supported by template.`)
						}

						var field = this._fields[name](filter, aggregator, column)

						if (typeof field === 'object') {
							if (field.columns) columns.push(...field.columns)
							else columns.push(name)
							selects.push(field.sql)
						} else {
							columns.push(name)
							selects.push(field)
						}
					})

					columns = _.uniq(columns)
					return { columns, selects }
				})
				.then(({ columns, selects }) => {
					// Create SQL query
					var from = filter.getFrom()
					var to = filter.getTo()
					var where = ''
					if (from) where += `timestamp >= '${from.toISOString()}'`
					if (to) where += `${where ? ' AND ' : ''} timestamp <= '${to.toISOString()}'`
					if (where) where = 'WHERE ' + where

					var order = ''
					var sorting = filter.getSorting().map(({ name, order }) => (
						`\`${name}\` ${order > 0 ? 'ASC' : 'DESC'}`
					))
					if (sorting.length) order = 'ORDER BY ' + sorting.join(', ')

					var limit = (filter.getLimit() ? `LIMIT ${filter.getLimit()}` : '')

					var sequelize = this._getProvider('sequelize').forDB('measurements')
					var query = (deviceIDs) => sequelize.query(
						`
							SELECT ${selects.join(',')}
							FROM ${'(' + deviceIDs.map((id) => (
								`(SELECT \`${columns.join('`, `')}\` FROM \`${id}\` ${where})`
							)).join('UNION ALL') + ')'} AS t
							GROUP BY UNIX_TIMESTAMP(timestamp) - UNIX_TIMESTAMP(timestamp) % ${filter.getInterval()}
							${order}
							${limit}
						`.replace(/\t/g, ''),
						{ type: sequelize.QueryTypes.SELECT }
					)
					var list = new (this._MeasurementListModel)({ filter }, this._getProviderFactory())

					if (filter.isGrouped()) {
						return query(deviceIDs)
							.then((items) => list.setItems(items)) // Returns list
					} else {
						return Promise.all(deviceIDs.map((id) => query([id])))
							.then((lists) => _.object(deviceIDs, lists))
							.then((items) => list.setItems(items)) // Returns list
					}
				})
				.then((list) => resolve(list))
				.catch(reject)
		})
	}
}

module.exports = MeasurementProvider
