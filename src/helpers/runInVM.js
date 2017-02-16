const { VM } = require('vm2')
const _ = require('underscore')
const sift = require('sift')

module.exports = (config) => {
	if (typeof config !== 'object') {
		throw new Error('Invalid config object.')
	}
	if (config.timeout === undefined) {
		config.timeout = 1000
	}
	if (typeof config.script !== 'object' || typeof config.script.fn !== 'string') {
		throw new Error('Missing script.fn function body.')
	}

	var script = config.script
	delete config.script

	config.sandbox = config.sandbox || {}

	if (Array.isArray(script.require)) {
		_.forEach(script.require, (pkg) => {
			switch (pkg) {
			case 'underscore': config.sandbox._ = _; break
			case 'sift': config.sandbox.sift = sift; break
			default:
				throw new Error(`Invalid requirement ${pkg}.`)
			}
		})
	}

	var vm = new VM(config)

	return vm.run('(function(){' + script.fn + '})()')
}
