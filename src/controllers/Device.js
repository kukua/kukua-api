const Promise = require('bluebird')
const BaseController = require('./Base')

class DeviceController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')

		app.get('/devices', auth.middleware, this._onIndex.bind(this))
		app.get('/devices/:id([\\da-fA-F]{16})', auth.middleware, this._onShow.bind(this))
	}

	_onIndex (req, res) {
		var group = this._getProvider('deviceGroup')
		var groupIDs = group.getRequestedIDs(req)

		var device = this._getProvider('device')
		var deviceIDs = device.getRequestedIDs(req)

		Promise.all(groupIDs.map((groupID) => group.findByID(groupID)))
			.then((groups) => group.getDeviceIDs(groups, deviceIDs))
			.then((deviceIDs) => {
				if (deviceIDs.length > 0) return device.find({ id: deviceIDs })
				return device.find()
			})
			.then((devices) => Promise.all(devices.map((device) => this._addIncludes(req, device))))
			.then((devices) => res.json(devices))
			.catch((err) => res.error(err))
	}
	_onShow (req, res) {
		this._getProvider('device').findByID(req.params.id)
			.then((device) => this._addIncludes(req, device))
			.then((device) => res.json(device))
			.catch((err) => res.error(err))
	}
}

module.exports = DeviceController
