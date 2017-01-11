const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const MeasurementFilter = require('../models/MeasurementFilter')
const getRequestedDeviceIds = require('../helpers/getRequestedDeviceIds')
const Measurement = require('../models/Measurement')

module.exports = class MeasurementController {
	constructor (app) {
		app.get('/measurements', auth(), this.onIndex.bind(this))
	}

	onIndex (req, res) {
		Promise.all([ MeasurementFilter.fromRequest(req), getRequestedDeviceIds(req) ])
			.then(([ filter, { devices, deviceGroups } ]) => filter
				.setDevices(devices)
				.setDeviceGroups(deviceGroups)
			)
			.then((filter) => Measurement.findByFilter(filter))
			.then((measurements) => res.json(measurements))
			.catch((err) => res.error(err))
	}
}
