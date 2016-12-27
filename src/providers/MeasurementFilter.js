const moment = require('moment-timezone')
const getRequestedUDIDs = require('../helpers/getRequestedUDIDs')
const MeasurementFilterModel = require('../models/MeasurementFilter')

module.exports = {
	fromRequest (req) {
		return getRequestedUDIDs(req).then((udids) => {
			var filter = new MeasurementFilterModel()
			var { fields, interval, from, to, sort, limit } = req.query

			filter.setUDIDs(udids)

			if (fields) {
				fields.split(',').forEach((field) => {
					var [ name, aggregator ] = field.split(':')
					filter.addField(name, aggregator)
				})
			}
			if (interval) filter.setInterval(parseInt(interval))
			if (from) filter.setFrom(moment.utc(from))
			if (to) filter.setTo(moment.utc(to))
			if (sort) {
				sort.split(',').forEach((name) => {
					var order = 1
					if (name.startsWith('-')) {
						name = name.substr(1)
						order = -1
					}
					filter.addSort(name, order)
				})
			}
			if (limit) filter.setLimit(parseInt(limit))

			return filter
		})
	},
}
