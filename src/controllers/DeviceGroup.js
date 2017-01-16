const Promise = require('bluebird')
const BaseController = require('./Base')

class DeviceGroupController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')

		app.get('/deviceGroups', auth.middleware, this._onIndex.bind(this))
		app.put(
			'/devices/:deviceId([\\da-fA-F]{16})/groups/:id([\\da-z\\-]+)',
			auth.middleware,
			this._onUpdate.bind(this)
		)
		app.delete(
			'/devices/:deviceId([\\da-fA-F]{16})/groups/:id([\\da-z\\-]+)',
			auth.middleware,
			this._onRemove.bind(this)
		)
	}

	_onIndex (req, res) {
		this._getProvider('deviceGroup').find()
			.then((groups) => Promise.all(groups.map((group) => this._addIncludes(req, group))))
			.then((groups) => res.json(groups))
			.catch((err) => res.error(err))
	}
	_onUpdate (req, res) {
		this._getProvider('device').findById(req.params.deviceId)
			.then((device) => this._getProvider('deviceGroup').addDeviceToGroup(device, req.params.id))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	_onRemove (req, res) {
		this._getProvider('device').findById(req.params.deviceId)
			.then((device) => this._getProvider('deviceGroup').removeDeviceFromGroup(device, req.params.id))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
}

module.exports = DeviceGroupController
