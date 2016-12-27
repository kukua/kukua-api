const Promise = require('bluebird')
const MeasurementFilterModel = require('../models/MeasurementFilter')

module.exports = {
	findByFilter: (filter) => new Promise((resolve, reject) => {
		if ( ! (filter instanceof MeasurementFilterModel)) return reject('Invalid measurement filter.')

		console.log(filter)
		resolve([])
	}),
}
