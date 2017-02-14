const BaseModel = require('./Base')

class DeviceModel extends BaseModel {
	get key () { return 'device' }

	loadGroups () {
		return this._getProvider('deviceGroup').findByDevice(this)
			.then((groups) => {
				var key = 'groups'
				this.set(key, groups)
				return [key, groups]
			})
	}
	loadTemplate () {
		return this._getProvider('template').findByDevice(this)
			.then((template) => {
				var key = 'template'
				this.set(key, template)
				return [key, template]
			})
	}
}

module.exports = DeviceModel
