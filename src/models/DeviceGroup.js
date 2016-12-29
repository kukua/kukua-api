const Promise = require('bluebird')
const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

var Device

class DeviceGroupModel extends Base {
	_loadDevices () {
		var udids = this.get('device_udids')
		if ( ! Array.isArray(udids)) udids = []

		return Promise.all(udids.map((udid) => Device.findByUDID(udid))).then((devices) => {
			this.set('devices', devices)
		})
	}

	toJSON () {
		var attr = Object.assign({}, this._attributes)

		delete attr.device_udids

		return attr
	}
}

DeviceGroupModel.setProvider = (DeviceGroupProvider) => {
	mapProviderMethods(DeviceGroupModel, DeviceGroupProvider)
}
DeviceGroupModel.setRelations = (DeviceModel) => {
	Device = DeviceModel
}

module.exports = DeviceGroupModel
