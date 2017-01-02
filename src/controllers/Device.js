const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const getRequestedUDIDs = require('../helpers/getRequestedUDIDs')
const Device = require('../models/Device')
const addIncludes = require('../helpers/addIncludes')
const { NotFoundError } = require('../helpers/errors')

module.exports = class DeviceController {
	constructor (app, log) {
		this._log = log

		app.get('/devices', auth(), this.onIndex.bind(this))
		app.get('/devices/:udid([\\da-fA-F]{16})', auth(), this.onShow.bind(this))
	}

	onIndex (req, res) {
		getRequestedUDIDs(req).then((udids) => {
			if (udids.length > 0) {
				return Device.find({ udid: udids })
			}

			return Device.find()
		}).then((devices) => {
			return Promise.all(devices.map((device) => addIncludes(req, device)))
		}).then((devices) => {
			res.json(devices)
		}).catch((err) => { res.error(err) })
	}
	onShow (req, res) {
		Device.findByUDID(req.params.udid).then((device) => {
			return addIncludes(req, device)
		}).then((device) => {
			res.json(device)
		}).catch(NotFoundError, () => { res.status(404).error('Device not found')
		}).catch((err) => { res.error(err) })
	}
}
