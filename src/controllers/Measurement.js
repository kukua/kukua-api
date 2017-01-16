const Promise = require('bluebird')
const BaseController = require('./Base')

class MeasurementController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')

		app.get('/measurements', auth.middleware, this._onIndex.bind(this))
	}

	_onIndex (req, res) {
		var filter = this._getProvider('measurementFilter').fromRequest(req)

		var group = this._getProvider('deviceGroup')
		var groupIds = group.getRequestedIds(req)

		var device = this._getProvider('device')
		filter.setDevices(device.getRequestedIds(req))

		Promise.all(groupIds.map((groupId) => group.findById(groupId)))
			.then((groups) => filter.setDeviceGroups(groups))
			.then((filter) => this._getProvider('measurement').findByFilter(filter))
			.then((measurements) => res.json(measurements))
			.catch((err) => res.error(err))
	}
}

module.exports = MeasurementController
