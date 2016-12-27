const Base = require('./Base')

module.exports = class DeviceGroup extends Base {
	toJSON () {
		var attr = Object.assign({}, this._attributes)

		delete attr.device_udids

		return attr
	}
}
