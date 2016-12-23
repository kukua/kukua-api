module.exports = class Device {
	constructor (attributes) {
		this._attributes = attributes || {}
	}

	toJSON () {
		return this._attributes
	}
}
