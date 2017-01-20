const _ = require('underscore')
const express = require('express')
const BaseController = require('../../src/controllers/Base')

describe('BaseController', () => {
	it('is a controller class', () => {
		expect(typeof BaseController).toBe('function')
		expect(BaseController.name).toBe('BaseController')
		expect(typeof BaseController.constructor).toBe('function')
	})

	// Fixtures
	const app = express()
	const providers = {
		test: { a: true },
	}
	const providerFactory = (name) => providers[name]

	it('expects an app and provider factory', () => {
		expect(() => new BaseController()).toThrowError('Invalid Express app.')
		expect(() => new BaseController(app)).toThrowError('Invalid provider factory.')
		expect(() => new BaseController(app, providerFactory)).not.toThrow()
	})
	it('has required methods', () => {
		expect([]).toEqual(_.difference(
			Object.getOwnPropertyNames(BaseController.prototype),
			[
				'constructor', '_getProviderFactory', '_getProvider', '_addIncludes',
				'_canCreate', '_canRead', '_canUpdate', '_canDelete', '_can',
			]
		))
	})

	it('should return provider factory in  _getProviderFactory method', () => {
		var controller = new BaseController(app, providerFactory)
		expect(typeof controller._getProviderFactory).toBe('function')
		expect(controller._getProviderFactory()).toBe(providerFactory)
	})
	it('should return requested provider in _getProvider method', () => {
		var controller = new BaseController(app, providerFactory)
		expect(typeof controller._getProviderFactory).toBe('function')
		expect(controller._getProvider('test')).toBe(providers.test)
	})
})
