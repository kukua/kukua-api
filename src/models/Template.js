const BaseModel = require('./Base')

class TemplateModel extends BaseModel {
	loadDevices () {
		return this._getProvider('device').find({ template_id: this.id })
			.then((devices) => {
				this.set('devices', devices)
			})
	}
}

module.exports = TemplateModel
