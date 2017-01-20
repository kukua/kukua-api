const _ = require('underscore')
const Promise = require('bluebird')
const BaseController = require('./Base')
const { NotFoundError, UnauthorizedError } = require('../helpers/errors')
const DeviceGroupModel = require('../models/DeviceGroup')

class DeviceGroupController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')

		app.get('/deviceGroups', auth.middleware, this._onIndex.bind(this))
		app.put(
			'/devices/:deviceID([\\da-fA-F]{16})/groups/:id([\\da-z\\-]+)',
			auth.middleware,
			this._onUpdate.bind(this)
		)
		app.delete(
			'/devices/:deviceID([\\da-fA-F]{16})/groups/:id([\\da-z\\-]+)',
			auth.middleware,
			this._onRemove.bind(this)
		)
	}

	_onIndex (req, res) {
		this._getAccessibleDeviceGroupIDs(req.session.user)
			.then((groupIDs) => this._getProvider('deviceGroup').find({ id: groupIDs }))
			.then((groups) => Promise.all(groups.map((group) => this._addIncludes(req, group))))
			.then((groups) => res.json(groups))
			.catch((err) => res.error(err))
	}
	_onUpdate (req, res) {
		var provider = this._getProvider('deviceGroup')

		this._getProvider('device').findByID(req.params.deviceID)
			.then((device) => this._canUpdate(req.session.user, device))
			.then((device) => provider.findByID(req.params.id)
				.then((group) => this._canUpdate(req.session.user, group))
				.then((group) => provider.addDeviceToGroup(device, group))
				// Create device group if it does not exist
				.catch(NotFoundError, () => provider.addDeviceToGroup(
					device, new DeviceGroupModel({ id: req.params.id }, this._getProviderFactory())
				))
			)
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	_onRemove (req, res) {
		var provider = this._getProvider('deviceGroup')

		this._getProvider('device').findByID(req.params.deviceID)
			.then((device) => this._canUpdate(req.session.user, device))
			.then((device) => provider.findByID(req.params.id)
				.then((group) => this._canUpdate(req.session.user, group))
				.then((group) => provider.removeDeviceFromGroup(device, group))
			)
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}

	_getAccessibleDeviceGroupIDs (user) {
		var providerFactory = this._getProviderFactory()
		var filterAccessible = (groupIDs) => {
			var promises = groupIDs.map((id) => {
				var model = new DeviceGroupModel({ id }, providerFactory)

				return this._canRead(user, model)
					.then(() => id)
					.catch(UnauthorizedError, () => null)
			})

			return Promise.all(promises).then(_.compact)
		}

		return this._getProvider('deviceGroup').getAllIDs()
			.then(filterAccessible)
	}
}

module.exports = DeviceGroupController
