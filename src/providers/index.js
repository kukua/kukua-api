const classify = require('underscore.string/classify')

// Factory
var providers = {}

function factory (name) {
	name = classify(name)
	var file = name

	if ( ! providers[name]) {
		var Class = require('./' + file)
		providers[name] = new Class(factory)
	}

	return providers[name]
}

module.exports = factory
