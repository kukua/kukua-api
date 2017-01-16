const Promise = require('bluebird')
const BaseModel = require('./Base')

class DeviceGroupModel extends BaseModel {
	constructor (attributes, providerFactory) {
		super(attributes, providerFactory)
	}

	loadDevices () {
		var deviceIDs = this.get('devices')

		if ( ! Array.isArray(deviceIDs)) deviceIDs = []

		return Promise.all(deviceIDs.map((id) => this._getProvider('device').findByID(id)))
			.then((devices) => {
				this.set('devices', devices)
			})
	}
}

module.exports = DeviceGroupModel
