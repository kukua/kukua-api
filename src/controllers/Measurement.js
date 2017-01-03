const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const MeasurementFilter = require('../models/MeasurementFilter')
const getRequestedUDIDs = require('../helpers/getRequestedUDIDs')
const Measurement = require('../models/Measurement')

module.exports = class MeasurementController {
	constructor (app) {
		app.get('/measurements', auth(), this.onIndex.bind(this))
	}

	onIndex (req, res) {
		Promise.all([ MeasurementFilter.fromRequest(req), getRequestedUDIDs(req) ])
			.then(([ filter, { udids, deviceGroups } ]) => filter
				.setUDIDs(udids)
				.setDeviceGroups(deviceGroups)
			)
			.then((filter) => Measurement.findByFilter(filter))
			.then((measurements) => res.json(measurements))
			.catch((err) => res.error(err))
	}
}
