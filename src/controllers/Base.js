const Promise = require('bluebird')
const BaseModel  = require('../models/Base')

class BaseController {
	constructor (app, providerFactory) {
		if (typeof app !== 'function' || typeof app.use !== 'function') {
			throw new Error('Invalid Express app.')
		}
		if (typeof providerFactory !== 'function') {
			throw new Error('Invalid provider factory.')
		}

		this._providerFactory = providerFactory
	}

	_getProviderFactory () {
		return this._providerFactory
	}
	_getProvider (name) {
		return this._getProviderFactory()(name)
	}

	_addIncludes (req, model) {
		if ( ! req.query.includes) return Promise.resolve(model)
		if ( ! (model instanceof BaseModel)) return Promise.reject('Invalid model given.')

		return model.load(req.query.includes.split(','))
			.then(() => model)
	}
}

module.exports = BaseController
