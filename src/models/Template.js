const Base = require('./Base')
const mapProviderMethods = require('../helpers/mapProviderMethods')

var Device

class TemplateModel extends Base {
	_loadDevices () {
		return Device.find({ template_id: this.id }).then((devices) => {
			this.set('devices', devices)
		})
	}
}

TemplateModel.setProvider = (TemplateProvider) => {
	mapProviderMethods(TemplateModel, TemplateProvider)
}
TemplateModel.setRelations = (DeviceModel) => {
	Device = DeviceModel
}

module.exports = TemplateModel
