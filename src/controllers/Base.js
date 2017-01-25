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
		if ( ! req.query.includes) {
			return Promise.resolve(model)
		}
		if (Array.isArray(model)) {
			return Promise.all(model.map((model) => this._addIncludes(req, model)))

		}
		if ( ! (model instanceof BaseModel)) {
			return Promise.reject('Invalid model.')
		}

		return model.load(req.query.includes.split(','))
			.then(() => model)
	}

	// Verify CRUD operations
	_canCreate (user, model) {
		return this._can(user, model, 'create')
	}
	_canRead (user, model) {
		return this._can(user, model, 'read')
	}
	_canUpdate (user, model) {
		return this._can(user, model, 'update')
	}
	_canDelete (user, model) {
		return this._can(user, model, 'delete')
	}
	_can (user, model, right) {
		if ( ! (model instanceof BaseModel)) return Promise.reject('Invalid model.')

		var rule = `${model.key}.${right}.${model.id}`

		return this._getProvider('accessControl').can(user, rule)
			.then(() => model) // Return model so _can can be chained
	}
}

module.exports = BaseController
