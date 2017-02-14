const BaseModel = require('./Base')

class TemplateModel extends BaseModel {
	loadDevices () {
		return this._getProvider('device').find({ template_id: this.id })
			.then((devices) => {
				var key = 'devices'
				this.set(key, devices)
				return [key, devices]
			})
	}
}

module.exports = TemplateModel
