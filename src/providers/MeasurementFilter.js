const moment = require('moment-timezone')
const parseDuration = require('parse-duration')
const providers = require('./')
const MeasurementFilterModel = require('../models/MeasurementFilter')

const methods = {
	fromRequest (req) {
		var filter = new MeasurementFilterModel({}, providers)
		var { fields, interval, from, to, sort, limit } = req.query

		if (fields) {
			fields.split(',').forEach((field) => {
				var [ name, aggregator ] = field.split(':')
				if (aggregator) aggregator = aggregator.toLowerCase()
				filter.addField(name, aggregator)
			})
		} else {
			filter.addField('timestamp')
		}
		if (interval) {
			if ( ! interval.match(/^[0-9]+$/)) {
				interval = Math.round(parseDuration(interval) / 1000)
			}

			filter.setInterval(parseInt(interval))
		} else {
			filter.setInterval(300)
		}

		filter.setFrom(from ? moment.utc(from) : moment.utc().subtract(1, 'day'))
		filter.setTo(moment.utc(to || undefined))

		if (sort) {
			sort.split(',').forEach((name) => {
				var order = 1
				if (name.startsWith('-')) {
					name = name.substr(1)
					order = -1
				}
				name = name.replace(':', '_') // In case of -temp:max for temp:max field
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
