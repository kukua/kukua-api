const _ = require('underscore')
const Promise = require('bluebird')
const BaseController = require('./Base')
const DeviceModel = require('../models/Device')

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
			.then((deviceIDs) => this._getAccessibleDeviceIDs(req.session.user, deviceIDs))
			.then((deviceIDs) => device.find({ id: deviceIDs }))
			.then((devices) => Promise.all(devices.map((device) => this._addIncludes(req, device))))
			.then((devices) => res.json(devices))
			.catch((err) => res.error(err))
	}
	_onShow (req, res) {
		this._getProvider('device').findByID(req.params.id)
			.then((device) => this._canRead(req.session.user, device))
			.then((device) => this._addIncludes(req, device))
			.then((device) => res.json(device))
			.catch((err) => res.error(err))
	}

	_getAccessibleDeviceIDs (user, deviceIDs) {
		var providerFactory = this._getProviderFactory()
		var filterAccessible = (deviceIDs) => {
			var promises = deviceIDs.map((id) => {
				var model = new DeviceModel({ id }, providerFactory)

				return this._canRead(user, model)
					.then(() => id, () => null)
			})

			return Promise.all(promises)
				.then((deviceIDs) => _.compact(deviceIDs))
		}

		if (deviceIDs.length > 0) {
			return filterAccessible(deviceIDs)
		} else {
			return this._getProvider('device').getAllDeviceIDs()
				.then(filterAccessible)
		}
	}
}

module.exports = DeviceController
