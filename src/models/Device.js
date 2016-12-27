const Base = require('./Base')

module.exports = class Device extends Base {
	get id () {
		return this.get('udid')
	}
}
