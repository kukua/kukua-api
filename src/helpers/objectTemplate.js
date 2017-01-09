const _ = require('underscore')
const dot = require('dot-object')
const deepcopy = require('deepcopy')

module.exports = (template, data) => {
	var values = { data, context: data, ctx: data }
	var iterator = (data) => {
		if (typeof data === 'object') {
			if (data.$replace) return dot.pick(data.$replace, values)
			return _.mapObject(data, (value) => iterator(value))
		}
		if (Array.isArray(data)) {
			return _.map(data, (value) => iterator(value))
		}
		if (typeof data === 'string') {
			return data.replace(/{{([a-zA-Z0-9\.\_\[\] ]+)}}/g, (match, key) => {
				return dot.pick(key, values)
			})
		}
		return data
	}

	return iterator(deepcopy(template))
}
