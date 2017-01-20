const _ = require('underscore')
const Promise = require('bluebird')
const express = require('express')
const request = require('supertest')
const DeviceController = require('../../src/controllers/Device')
const BaseController = require('../../src/controllers/Base')
const DeviceModel = require('../../src/models/Device')
const DeviceGroupModel = require('../../src/models/DeviceGroup')

describe('DeviceController', () => {
	it('is a controller class', () => {
		expect(typeof DeviceController).toBe('function')
		expect(DeviceController.name).toBe('DeviceController')
		expect(typeof DeviceController.constructor).toBe('function')
		expect(DeviceController.prototype instanceof BaseController).toBe(true)
	})

	// Fixtures
	const app = express()

	express.response.error = console.error.bind(console)
	app.use((req, res, next) => {
		req.session = {}
		next()
	})

	const deviceId = 'abcdef0123456789'
	const providers = {}
	const providerFactory = (name) => providers[name]
	providers.auth = {
		middleware: (req, res, next) => next()
	}
	providers.accessControl = {
		can: () => Promise.resolve(),
	}
	providers.deviceGroup = {
		getRequestedIDs: (req) => ['abc'],
		findByID: (id) => Promise.resolve(new DeviceGroupModel({ id }, providerFactory)),
		getDeviceIDs: (groups, deviceIds) => [deviceId],
	}
	providers.device = {
		getRequestedIDs: (req) => [deviceId],
		find: (options) => Promise.resolve([ new DeviceModel({ id: deviceId }, providerFactory) ]),
		findByID: (id) => Promise.resolve(new DeviceModel({ id }, providerFactory)),
	}

	it('expects an app and provider factory', () => {
		expect(() => new DeviceController()).toThrowError('Invalid Express app.')
		expect(() => new DeviceController(app)).toThrowError('Invalid provider factory.')
		expect(() => new DeviceController(app, providerFactory)).not.toThrow()
	})
	it('has required methods', () => {
		expect([]).toEqual(_.difference(
			Object.getOwnPropertyNames(DeviceController.prototype),
			[
				'constructor', '_getProviderFactory', '_getProvider', '_addIncludes',
				'_onIndex', '_onShow', '_getAccessibleDeviceIDs',
			]
		))
	})

	it('has /devices route', (done) => {
		new DeviceController(app, providerFactory)

		request(app)
			.get('/devices')
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect('Content-Length', '27')
			.expect(200)
			.end((err, res) => {
				expect(err).toBe(null)
				done()
			})
	})
	it('has /devices/:id route', (done) => {
		new DeviceController(app, providerFactory)

		request(app)
			.get('/devices/abcdef0123456789')
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect('Content-Length', '25')
			.expect(200)
			.end((err, res) => {
				expect(err).toBe(null)
				done()
			})
	})

	// invalid ID
	// errors
	// auth
})
