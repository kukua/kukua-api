const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const getRequestedUDIDs = require('../helpers/getRequestedUDIDs')
const MeasurementFilterProvider = require('../providers/MeasurementFilter')
const MeasurementProvider = require('../providers/Measurement')
const respondWithError = require('../helpers/respondWithError')

module.exports = class MeasurementController {
	constructor (app, log) {
		//this._app = app
		this._log = log

		app.get('/measurements', auth(), this.onIndex.bind(this))
	}

	onIndex (req, res) {
		Promise.all([
			MeasurementFilterProvider.fromRequest(req),
			getRequestedUDIDs(req),
		]).then(([ filter, udids ]) => {
			filter.setUDIDs(udids)
			return MeasurementProvider.findByFilter(filter)
		}).then((measurements) => {
			res.json(measurements)
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
	}
}
