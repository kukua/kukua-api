class BaseInput {
	constructor (config = {}, providerFactory) {
		this.setConfig(config)
		this._providerFactory = providerFactory
	}

	setConfig (config) {
		this._config = config
	}
	getConfig () {
		return this._config
	}
	getModels () {
		throw new Error('Not implemented.')
	}
	getData () {
		throw new Error('Not implemented.')
	}

	setName (name) {
		this._name = name
		return this
	}
	getName () {
		return this._name || this.constructor.key || 'unnamed'
	}

	_getProviderFactory () {
		return this._providerFactory
	}
	_getProvider (name) {
		return this._getProviderFactory()(name)
	}
}

module.exports = BaseInput
