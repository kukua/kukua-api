const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const getRequestedUDIDs = require('../helpers/getRequestedUDIDs')
const Device = require('../models/Device')
const addIncludes = require('../helpers/addIncludes')

module.exports = class DeviceController {
	constructor (app) {
		app.get('/devices', auth(), this.onIndex.bind(this))
		app.get('/devices/:udid([\\da-fA-F]{16})', auth(), this.onShow.bind(this))
	}

	onIndex (req, res) {
		getRequestedUDIDs(req)
			.then((udids) => Device.find({ udid: udids }))
			.then((devices) => Promise.all(devices.map((device) => addIncludes(req, device))))
			.then((devices) => res.json(devices))
			.catch((err) => res.error(err))
	}
	onShow (req, res) {
		Device.findByUDID(req.params.udid)
			.then((device) => addIncludes(req, device))
			.then((device) => res.json(device))
			.catch((err) => res.error(err))
	}
}
