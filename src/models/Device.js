const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

var DeviceGroup

class DeviceModel extends Base {
	get id () {
		return this.get('udid')
	}

	_loadGroups () {
		return DeviceGroup.findByDevice(this).then((groups) => {
			this.set('groups', groups)
		})
	}
}

DeviceModel.setProvider = (DeviceProvider) => {
	mapProviderMethods(DeviceModel, DeviceProvider)
}
DeviceModel.setRelations = (DeviceGroupModel) => {
	DeviceGroup = DeviceGroupModel
}

module.exports = DeviceModel
