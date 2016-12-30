const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

var DeviceGroup, Template

class DeviceModel extends Base {
	get id () {
		return this.get('udid')
	}

	_loadGroups () {
		return DeviceGroup.findByDevice(this).then((groups) => {
			this.set('groups', groups)
		})
	}
	_loadTemplate () {
		return Template.findByDevice(this).then((template) => {
			this.set('template', template)
		})
	}
}

DeviceModel.setProvider = (DeviceProvider) => {
	mapProviderMethods(DeviceModel, DeviceProvider)
}
DeviceModel.setRelations = (DeviceGroupModel, TemplateModel) => {
	DeviceGroup = DeviceGroupModel
	Template = TemplateModel
}

module.exports = DeviceModel
