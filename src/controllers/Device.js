const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const getRequestedUDIDs = require('../helpers/getRequestedUDIDs')
const Device = require('../models/Device')
const addIncludes = require('../helpers/addIncludes')
const respondWithError = require('../helpers/respondWithError')
const { NotFoundError } = require('../helpers/errors')

module.exports = class DeviceController {
	constructor (app, log) {
		this._log = log

		app.get('/devices', auth(), this.onIndex.bind(this))
		app.get('/devices/:udid([\\da-fA-F]{16})', auth(), this.onShow.bind(this))
	}

	onIndex (req, res) {
		getRequestedUDIDs(req).then((udids) => {
			if (udids) return Device.find({ udid: udids })

			return Device.find()
		}).then((devices) => {
			return Promise.all(devices.map((device) => addIncludes(req, device)))
		}).then((devices) => {
			res.json(devices)
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
	}
	onShow (req, res) {
		Device.findByUDID(req.params.udid).then((device) => {
			return addIncludes(req, device)
		}).then((device) => {
			res.json(device)
		}).catch(NotFoundError, () => {
			respondWithError(res, 404, 'Device not found.')
		}).catch((err) => {
			this._log.error(err)
			respondWithError(res)
		})
	}
}
