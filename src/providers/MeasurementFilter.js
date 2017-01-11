const Promise = require('bluebird')
const moment = require('moment-timezone')
const parseDuration = require('parse-duration')
const MeasurementFilterModel = require('../models/MeasurementFilter')

module.exports = {
	fromRequest: (req) => new Promise((resolve, reject) => {
		try {
			var filter = new MeasurementFilterModel()
			var { fields, interval, from, to, sort, limit } = req.query

			if (fields) {
				fields.split(',').forEach((field) => {
					var [ name, aggregator ] = field.split(':')
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
					filter.addSort(name, order)
				})
			} else {
				filter.addSort('timestamp', -1)
			}
			if (limit) {
				filter.setLimit(parseInt(limit))
			}

			resolve(filter)
		} catch (err) {
			reject(err)
		}
	}),
}
