const _ = require('underscore')
const Promise = require('bluebird')
const BaseController = require('./Base')
const DeviceGroupModel = require('../models/DeviceGroup')

class DeviceGroupController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')
		var cache = this._getProvider('cache')

		app.get('/deviceGroups', auth.middleware, cache.middleware, this._onIndex.bind(this))
		app.get('/deviceGroups/:id([a-zA-Z0-9]+)', auth.middleware, this._onShow.bind(this))
		app.put('/deviceGroups/:id([a-zA-Z0-9]+)', auth.middleware, this._onUpdate.bind(this))
		app.delete('/deviceGroups/:id([a-zA-Z0-9]+)', auth.middleware, this._onRemove.bind(this))

		app.put(
			'/devices/:deviceID([a-fA-F0-9]{16})/groups/:id([a-zA-Z0-9]+)',
			auth.middleware,
			this._onDeviceAdd.bind(this)
		)
		app.delete(
			'/devices/:deviceID([a-fA-F0-9]{16})/groups/:id([a-zA-Z0-9]+)',
			auth.middleware,
			this._onDeviceRemove.bind(this)
		)
	}

	_onIndex (req, res) {
		var user = req.session.user

		this._getProvider('deviceGroup').find()
			.then((groups) => Promise.all(
				groups.map((group) => {
					return this._canRead(user, group)
						.then(() => group, () => null) // Filter out prohibited
				})
			))
			.then((groups) => _.compact(groups))
			.then((groups) => this._addIncludes(req, groups))
			.then((groups) => this._getProvider('cache').respond(req, res, groups))
			.catch((err) => res.error(err))
	}
	_onShow (req, res) {
		this._getProvider('deviceGroup').findByID(req.params.id)
			.then((group) => this._canRead(req.session.user, group))
			.then((group) => this._addIncludes(req, group))
			.then((group) => res.json(group))
			.catch((err) => res.error(err))
	}
	_onUpdate (req, res) {
		var group = new DeviceGroupModel({ id: req.params.id }, this._getProviderFactory())

		this._canUpdate(req.session.user, group)
			.then((group) => group.fill(req.body))
			.then((group) => this._getProvider('deviceGroup').update(group))
			.then((group) => res.json(group))
			.catch((err) => res.error(err))
	}
	_onRemove (req, res) {
		var provider = this._getProvider('deviceGroup')

		provider.findByID(req.params.id)
			.then((group) => this._canDelete(req.session.user, group))
			.then((group) => provider.remove(group))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}

	_onDeviceAdd (req, res) {
		var user = req.session.user
		var provider = this._getProvider('deviceGroup')

		Promise.all([
			this._getProvider('device').findByID(req.params.deviceID)
				.then((device) => this._canUpdate(user, device)),
			provider.findByID(req.params.id)
				.then((group) => this._canUpdate(user, group)),
		])
			.then(([ device, group ]) => provider.addDeviceToGroup(device, group))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	_onDeviceRemove (req, res) {
		var user = req.session.user
		var provider = this._getProvider('deviceGroup')

		Promise.all([
			this._getProvider('device').findByID(req.params.deviceID)
				.then((device) => this._canUpdate(user, device)),
			provider.findByID(req.params.id)
				.then((group) => this._canUpdate(user, group)),
		])
			.then(([ device, group ]) => provider.removeDeviceFromGroup(device, group))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
}

module.exports = DeviceGroupController
