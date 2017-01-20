const ValidatorJS = require('validatorjs')
const Validator = require('../../src/helpers/validator')

describe('Validator helper', () => {
	it('should be the ValidatorJS class', () => {
		expect(typeof Validator).toBe('function')
		expect(typeof Validator.constructor).toBe('function')
		expect(Validator).toBe(ValidatorJS)
	})
	it('should provide a human readable duration validator', () => {
		var validator = new Validator({
			foo: 'aaa',
		}, {
			foo: 'duration',
		})
		expect(validator.fails()).toBe(true)
		expect(validator.errors.all()).toEqual({
			foo: ['The foo field must be a valid duration of at least 1m.'],
		})
		validator = new Validator({
			foo: '5m',
		}, {
			foo: 'duration',
		})
		expect(validator.passes()).toBe(true)
	})
	it('should provide a cron expression validator', () => {
		var validator = new Validator({
			foo: 'aaa',
		}, {
			foo: 'cron',
		})
		expect(validator.fails()).toBe(true)
		expect(validator.errors.all()).toEqual({
			foo: ['The foo field must be a valid cron expression.'],
		})
		validator = new Validator({
			foo: '20 * * * *',
		}, {
			foo: 'cron',
		})
		expect(validator.passes()).toBe(true)
	})
	it('should provide an object validator', () => {
		var validator = new Validator({
			foo: 'aaa',
		}, {
			foo: 'object',
		})
		expect(validator.fails()).toBe(true)
		expect(validator.errors.all()).toEqual({
			foo: ['The foo field must be an object.'],
		})
		validator = new Validator({
			foo: { a: true },
		}, {
			foo: 'object',
		})
		expect(validator.passes()).toBe(true)
	})
})
