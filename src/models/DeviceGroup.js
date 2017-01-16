const Promise = require('bluebird')
const BaseModel = require('./Base')

class DeviceGroupModel extends BaseModel {
	constructor (attributes, providerFactory) {
		super(attributes, providerFactory)
	}

	loadDevices () {
		var deviceIds = this.get('devices')

		if ( ! Array.isArray(deviceIds)) deviceIds = []

		return Promise.all(deviceIds.map((id) => this._getProvider('device').findById(id)))
			.then((devices) => {
				this.set('devices', devices)
			})
	}
}

module.exports = DeviceGroupModel
