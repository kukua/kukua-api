const Promise = require('bluebird')
const auth = require('../helpers/authenticate')
const getRequestedDeviceIds = require('../helpers/getRequestedDeviceIds')
const Device = require('../models/Device')
const addIncludes = require('../helpers/addIncludes')
const getAllDeviceIds = require('../helpers/getAllDeviceIds')

module.exports = class DeviceController {
	constructor (app) {
		app.get('/devices', auth(), this.onIndex.bind(this))
		app.get('/devices/:id([\\da-fA-F]{16})', auth(), this.onShow.bind(this))
	}

	onIndex (req, res) {
		getRequestedDeviceIds(req)
			.then(({ devices, deviceGroups }) => {
				var deviceIds = getAllDeviceIds(deviceGroups, devices)
				if (deviceIds.length > 0) return Device.find({ id: deviceIds })
				return Device.find()
			})
			.then((devices) => Promise.all(devices.map((device) => addIncludes(req, device))))
			.then((devices) => res.json(devices))
			.catch((err) => res.error(err))
	}
	onShow (req, res) {
		Device.findById(req.params.id)
			.then((device) => addIncludes(req, device))
			.then((device) => res.json(device))
			.catch((err) => res.error(err))
	}
}
