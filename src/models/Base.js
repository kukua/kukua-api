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

	fill (data) {
		if (typeof data !== 'object') {
			throw new Error('Invalid data object.')
		}

		data = Object.assign({}, this.get(), data)

		if (typeof this.validate === 'function') {
			this.validate(data)
		}

		this.set(data)
		return this
	}

	_getProviderFactory () {
		return this._providerFactory
	}
	_getProvider (name) {
		return this._getProviderFactory()(name)
	}

	toJSON () {
		return this._attributes
	}
}

module.exports = BaseModel
