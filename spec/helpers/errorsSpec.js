const errors = require('../../src/helpers/errors')

describe('Errors helper', () => {
	it('is an object with Error classes', () => {
		expect(typeof errors).toBe('object')
		Object.keys(errors).forEach((key) => {
			var Class = errors[key]
			expect(Class.prototype instanceof Error).toBe(true)
		})
	})

	it('provides Error classes with statusCodes', () => {
		var statusCodes = {
			ValidationError: 400,
			BadRequestError: 400,
			UnauthorizedError: 401,
			NotFoundError: 404,
			InternalServerError: 500,
		}

		Object.keys(errors).forEach((key) => {
			var Class = errors[key]
			var instance = new Class()
			expect(instance.statusCode).toBe(statusCodes[key])
		})
	})
})
