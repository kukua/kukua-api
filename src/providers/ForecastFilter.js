const moment = require('moment-timezone')
const providers = require('./')
const ForecastFilterModel = require('../models/ForecastFilter')

const methods = {
	fromRequest (req) {
		var filter = new ForecastFilterModel({}, providers)
		var { type, location, fields, from, to, sort, limit } = req.query

		if (type) {
			filter.setType(type)
		}

		filter.setLocation(parseInt(location))

		filter.addField('timestamp')
		if (fields) {
			fields.split(',').forEach((name) => filter.addField(name))
		}

		var days = (filter.getType() === 'daily' ? 7 : 1)
		filter.setFrom(from ? moment.utc(from) : moment.utc().subtract(days, 'day'))
		filter.setTo(moment.utc(to || undefined))

		if (sort) {
			sort.split(',').forEach((name) => {
				var order = 1
				if (name.startsWith('-')) {
					name = name.substr(1)
					order = -1
				}
				filter.addSort(name, order)
			})
		} else {
			filter.addSort('timestamp', -1)
		}

		if (limit) {
			filter.setLimit(parseInt(limit))
		}

		return filter
	},
}

module.exports = methods
