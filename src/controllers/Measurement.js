const Promise = require('bluebird')
const BaseController = require('./Base')
const DeviceModel = require('../models/Device')

class MeasurementController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')

		app.get('/measurements', auth.middleware, this._onIndex.bind(this))
	}

	_onIndex (req, res) {
		var filter = this._getProvider('measurementFilter').fromRequest(req)

		var group = this._getProvider('deviceGroup')
		var groupIDs = group.getRequestedIDs(req)

		var device = this._getProvider('device')
		filter.setDevices(device.getRequestedIDs(req))

		var user = req.session.user
		var providerFactory = this._getProviderFactory()

		Promise.all(groupIDs.map((groupID) => group.findByID(groupID)))
			.then((groups) => filter.setDeviceGroups(groups))
			.then((filter) => {
				return Promise.all(
					filter.getAllDeviceIDs().map((id) => (
						this._canRead(user, new DeviceModel({ id }, providerFactory))
					))
				).then(() => filter)
			})
			.then((filter) => this._getProvider('measurement').findByFilter(filter))
			.then((list) => res.json(list))
			.catch((err) => res.error(err))
	}
}

module.exports = MeasurementController
