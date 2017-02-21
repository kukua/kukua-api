const _ = require('underscore')
const classify = require('underscore.string/classify')
const Promise = require('bluebird')
const BaseModel  = require('../models/Base')
const { UnauthorizedError } = require('../helpers/errors')

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

		var user = req.session.user

		return Promise.all(req.query.includes.split(',').map((relation) => {
			var parts = relation.split('.')
			var promise = Promise.resolve(model)

			for (let i = 0; i < parts.length; i += 1) {
				promise = promise.then((modelOrModels) => {
					var fn = 'load' + classify(parts[i])
					var models = (modelOrModels instanceof BaseModel ? [modelOrModels] : modelOrModels)

					return Promise.all(models.map((model) => {
						if (typeof model[fn] !== 'function') {
							console.log(parts, i)
							throw new Error('Invalid relation: ' + parts.slice(0, i + 1).join('.'))
						}

						return model[fn]()
							.then(([key, modelOrModels]) => {
								// Check read permissions
								if (modelOrModels instanceof BaseModel) {
									return this._canRead(user, modelOrModels)
										// Remove if cannot be read
										.catch(UnauthorizedError, () => model.set(key, undefined))
										.then(() => model.get(key))
								} else if (Array.isArray(modelOrModels)) {
									return Promise.all(modelOrModels.map((model) => {
										return this._canRead(user, model)
											.catch(UnauthorizedError, () => null)
									}))
										// Replace with ones that can be read
										.then((models) => model.set(key, _.compact(models)))
										.then(() => model.get(key))
								} else {
									// No way of checking permissions, so skip (e.g. UserConfig object)
									return Promise.resolve(undefined)
								}
							})
					}))
						.then((subModels) => _.compact(_.flatten(subModels)))
				})
			}

			return promise
		})).then(() => model)
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
