const Validator = require('validatorjs')
const parseDuration = require('parse-duration')
const cronParser = require('cron-parser')

Validator.register('duration', (value) => {
	return parseDuration(value) >= 60 * 1000
}, 'The :attribute field must be a valid duration of at least 1m.')

Validator.register('cron', (value) => {
	try {
		cronParser.parseExpression(value)
		return true
	} catch (err) {
		return false
	}
}, 'The :attribute field must be a valid cron expression.')

Validator.register('object', (value) => {
	return (typeof value === 'object' && ! Array.isArray(value))
}, 'The :attribute field must be an object.')

module.exports = Validator
