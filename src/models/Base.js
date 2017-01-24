const _ = require('underscore')
const classify = require('underscore.string/classify')

class BaseModel {
	constructor (attributes, providerFactory) {
		this._attributes = attributes || {}
		this._providerFactory = providerFactory
	}

	get key () { throw new Error('Model key getter not implemented.') }
	get id () { return this.get('id')  }

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

	_getProviderFactory () {
		return this._providerFactory
	}
	_getProvider (name) {
		return this._getProviderFactory()(name)
	}

	load (...relations) {
		return Promise.all(_.flatten(relations).map((relation) => {
			var fn = 'load' + classify(relation)

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

module.exports = BaseModel
