module.exports = class Base {
	constructor (attributes) {
		this._attributes = attributes || {}
	}

	set (key, value) {
		if (typeof key === 'object') {
			this._attributes = key
		} else {
			this._attributes[key] = value
		}
	}
	get (key) {
		if (key === undefined) {
			return this._attributes
		}
		return this._attributes[key]
	}

	get id () {
		return this.get('id')
	}

	toJSON () {
		return this._attributes
	}
}
