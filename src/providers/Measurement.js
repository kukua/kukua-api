const _ = require('underscore')
const Promise = require('bluebird')
const MeasurementFilterModel = require('../models/MeasurementFilter')
const DeviceModel = require('../models/Device')
const fields = require('../config/fields')
const sequelize = require('../helpers/sequelize')('measurements')

const createResponse = (filter, columns, values) => ({
	filter,
	columns,
	values,
})

module.exports = {
	findByFilter: (filter) => new Promise((resolve, reject) => {
		if ( ! (filter instanceof MeasurementFilterModel)) return reject('Invalid measurement filter.')

		var udids = filter.getAllUDIDs()

		if (udids.length === 0) {
			return resolve(createResponse(filter, [], []))
		}

		DeviceModel.find({ udid: udids }).then((devices) => {
			return Promise.all(devices.map((device) => device.load('template'))).then(() => {
				return devices.map((device) => device.get('template').get('attributes'))
			}, reject)
		}, reject).then((attributes) => {
			// Check if all devices support requested fields
			var uncommon = _.difference(...attributes)
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
			filter.getFields().forEach(({ name, aggregator }) => {
				if ( ! fields[name]) {
					throw new Error('Field not supported by template.')
				}

				columns.push(name)
				selects.push(fields[name](filter, aggregator))
			})

			var where = `timestamp >= '${filter.getFrom().toISOString()}' AND timestamp <= '${filter.getTo().toISOString()}'`

			var order = ''
			var sorting = filter.getSorting().map(({ name, order }) => `\`${name}\` ${order > 0 ? 'ASC' : 'DESC'}`)
			if (sorting.length) order = 'ORDER BY ' + sorting.join(', ')

			var limit = (filter.getLimit() ? `LIMIT ${filter.getLimit()}` : '')

			var from = udids.map((udid) => (
				`(SELECT \`${columns.join('`, `')}\` FROM \`${udid}\` WHERE ${where})`
			)).join('UNION')

			var sql = `
				SELECT ${selects.join(', ')}
				FROM (${from}) AS t
				GROUP BY UNIX_TIMESTAMP(timestamp) - UNIX_TIMESTAMP(timestamp) % ${filter.getInterval()}
				${order}
				${limit}
			`

			sequelize.query(sql, { type: sequelize.QueryTypes.SELECT }).then((results) => {
				resolve(createResponse(filter, columns, _.map(results, (result) => _.values(result))))
			})
		}).catch(reject)
	}),
}
