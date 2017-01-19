class BaseProvider {
	constructor (providerFactory) {
		this._providerFactory = providerFactory
	}

	_getProviderFactory () {
		return this._providerFactory
	}
	_getProvider (name) {
		return this._getProviderFactory()(name)
	}
}

module.exports = BaseProvider
