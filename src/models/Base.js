const _ = require('underscore')
const classify = require('underscore.string/classify')

module.exports = class BaseModel {
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

	load (...relations) {
		return Promise.all(_.flatten(relations).map((relation) => {
			var fn = '_load' + classify(relation)

			if (typeof this[fn] !== 'function') {
				throw new Error('Invalid relation: ' + relation)
			}

			return this[fn]()
		}))
	}

	toJSON () {
		return this._attributes
	}
}
