const auth = require('../helpers/authenticate')
const MeasurementProvider = require('../providers/Measurement')
const MeasurementFilterProvider = require('../providers/MeasurementFilter')
const respondWithError = require('../helpers/respondWithError')

module.exports = class MeasurementController {
	constructor (app, log) {
		//this._app = app
		this._log = log

		app.get('/measurements', auth(), this.onIndex.bind(this))
	}

	onIndex (req, res) {
		MeasurementFilterProvider.fromRequest(req).then((filter) => {
			return MeasurementProvider.findByFilter(filter)
		}).then((measurements) => {
			res.json(measurements)
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
	}
}
