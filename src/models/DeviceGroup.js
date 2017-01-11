const Promise = require('bluebird')
const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

var Device

class DeviceGroupModel extends Base {
	loadDevices () {
		var deviceIds = this.get('devices')
		if ( ! Array.isArray(deviceIds)) deviceIds = []

		return Promise.all(deviceIds.map((id) => Device.findById(id)))
			.then((devices) => {
				this.set('devices', devices)
			})
	}
}

DeviceGroupModel.setProvider = (DeviceGroupProvider) => {
	mapProviderMethods(DeviceGroupModel, DeviceGroupProvider)
}
DeviceGroupModel.setRelations = (DeviceModel) => {
	Device = DeviceModel
}

module.exports = DeviceGroupModel
