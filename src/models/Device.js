const BaseModel = require('./Base')

class DeviceModel extends BaseModel {
	constructor (attributes, providerFactory) {
		super(attributes, providerFactory)
	}

	loadGroups () {
		return this._getProvider('deviceGroup').findByDevice(this)
			.then((groups) => {
				this.set('groups', groups)
			})
	}
	loadTemplate () {
		return this._getProvider('template').findByDevice(this)
			.then((template) => {
				this.set('template', template)
			})
	}
}

module.exports = DeviceModel
