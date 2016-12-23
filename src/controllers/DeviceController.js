const DeviceProvider = require('../providers/Device')
const auth = require('../helpers/authenticate')
const respondWithError = require('../helpers/respondWithError')
const { NotFoundError } = require('../helpers/errors')

module.exports = class DeviceController {
	constructor (app, log) {
		//this._app = app
		this._log = log

		app.get('/devices', auth(), this.onIndex.bind(this))
		app.get('/devices/:udid([\\da-fA-F]{16})', auth(), this.onShow.bind(this))
	}

	onIndex (req, res) {
		if ( ! this._acceptsJSON(req, res)) return

		DeviceProvider.find().then((devices) => {
			res.json(devices)
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res, 500)
		})
	}
	onShow (req, res) {
		if ( ! this._acceptsJSON(req, res)) return

		DeviceProvider.findByUDID(req.params.udid).then((device) => {
			res.json(device)
		}).catch(NotFoundError, () => {
			respondWithError(res, 404, 'Device not found.')
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res, 500)
		})
	}

	_acceptsJSON (req, res) {
		if (req.accepts(['json', 'application/json'])) {
			return true
		}

		respondWithError(res, 400, 'Request does not accept JSON response.')
		return false
	}
}
