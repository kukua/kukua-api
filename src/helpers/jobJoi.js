const joi = require('joi')
const parseDuration = require('parse-duration')
const cronParser = require('cron-parser')

module.exports = joi.extend({
	base: joi.string(),
	name: 'duration',
	language: {
		invalid: '!!"{{path}}" needs to be a valid duration',
		too_small: '!!"{{path}}" needs to be at least a minute',
	},
	pre (value, state, options) {
		value = parseDuration(value)
		if (value === 0) {
			return this.createError('duration.invalid', { path: state.path }, state, options)
		}
		if (value < 60 * 1000) {
			return this.createError('duration.too_small', { path: state.path }, state, options)
		}
		return value
	},
}).extend({
	base: joi.string(),
	name: 'cron',
	language: {
		invalid: '!!"{{path}}" needs to be a valid cronjob expression',
	},
	pre (value, state, options) {
		try {
			return cronParser.parseExpression(value)
		} catch (err) {
			return this.createError('cron.invalid', { path: state.path }, state, options)
		}
	},
})
