const BaseModel = require('./Base')
const Validator = require('../helpers/validator')
const { ValidationError } = require('../helpers/errors')

class JobResultModel extends BaseModel {
	get key () { return 'jobResult' }

	getSchema () {
		return {
			id: 'string|regex:/^[a-zA-Z0-9]+$/',
			job_id: 'required|string|regex:/^[a-zA-Z0-9]+$/',
			data: 'object',
			error: 'object',
			created_at: 'date',
			updated_at: 'date',
		}
	}
	validate (data) {
		var validator = new Validator(data || this.get(), this.getSchema())

		if (validator.fails()) {
			throw new ValidationError('Invalid job result.', validator.errors.all())
		}
	}

	setData (data) {
		if (typeof data !== 'object') {
			throw new Error('Invalid data object.')
		}

		this.set('data', data)
		return this
	}
	setError (err) {
		if ( ! (err instanceof Error)) {
			throw new Error('Invalid Error instance.')
		}

		this.set('error', err)
		return this
	}
}

module.exports = JobResultModel
