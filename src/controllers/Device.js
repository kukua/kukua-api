const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const getRequestedUDIDs = require('../helpers/getRequestedUDIDs')
const Device = require('../models/Device')
const addIncludes = require('../helpers/addIncludes')
const getAllUDIDs = require('../helpers/getAllUDIDs')

module.exports = class DeviceController {
	constructor (app) {
		app.get('/devices', auth(), this.onIndex.bind(this))
		app.get('/devices/:udid([\\da-fA-F]{16})', auth(), this.onShow.bind(this))
	}

	onIndex (req, res) {
		getRequestedUDIDs(req)
			.then(({ udids, deviceGroups }) => {
				udids = getAllUDIDs(deviceGroups, udids)
				if (udids.length > 0) return Device.find({ udid: udids })
				return Device.find()
			})
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
