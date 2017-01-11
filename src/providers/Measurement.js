const _ = require('underscore')
const Promise = require('bluebird')
const MeasurementFilterModel = require('../models/MeasurementFilter')
const MeasurementListModel = require('../models/MeasurementList')
const DeviceModel = require('../models/Device')
const fields = require('../config/fields')
const sequelize = require('../helpers/sequelize')('measurements')

module.exports = {
	findByFilter: (filter) => new Promise((resolve, reject) => {
		if ( ! (filter instanceof MeasurementFilterModel)) return reject('Invalid measurement filter.')

		var deviceIds = filter.getAllDeviceIds()

		if (deviceIds.length === 0) {
			return resolve(new MeasurementListModel(filter))
		}

		DeviceModel.find({ id: deviceIds }).then((devices) => {
			return Promise.all(devices.map((device) => device.load('template'))).then(() => {
				return devices.map((device) => device.get('template').get('attributes'))
			}, reject)
		}, reject).then((attributes) => {
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
		}).then(() => {
			var columns = []
			var selects = []
			filter.getFields().forEach(({ name, column, aggregator }) => {
				if ( ! fields[name]) {
					throw new Error(`Field "${name}" not supported by template.`)
				}

				columns.push(name)
				selects.push(fields[name](filter, aggregator, column))
			})
			columns = _.uniq(columns)

			var from = filter.getFrom()
			var to = filter.getTo()
			var where = ''
			if (from) where += `timestamp >= '${from.toISOString()}'`
			if (to) where += `${where ? ' AND ' : ''} timestamp <= '${to.toISOString()}'`
			if (where) where = 'WHERE ' + where

			var order = ''
			var sorting = filter.getSorting().map(({ name, order }) => `\`${name}\` ${order > 0 ? 'ASC' : 'DESC'}`)
			if (sorting.length) order = 'ORDER BY ' + sorting.join(', ')

			var limit = (filter.getLimit() ? `LIMIT ${filter.getLimit()}` : '')

			var tables = deviceIds.map((id) => (
				`(SELECT \`${columns.join('`, `')}\` FROM \`${id}\` ${where})`
			)).join('UNION ALL')

			var sql = `
				SELECT ${selects.join(', ')}
				FROM (${tables}) AS t
				GROUP BY UNIX_TIMESTAMP(timestamp) - UNIX_TIMESTAMP(timestamp) % ${filter.getInterval()}
				${order}
				${limit}
			`.replace(/\t/g, '')

			sequelize.query(sql, { type: sequelize.QueryTypes.SELECT }).then((results) => {
				resolve(new MeasurementListModel(filter, results))
			}, reject)
		}).catch(reject)
	}),
}
