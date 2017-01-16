const Promise = require('bluebird')
const { VM } = require('vm2')
const BaseAction = require('./Base')

class TransformAction extends BaseAction {
	exec (data) {
		return new Promise((resolve, reject) => {
			const vm = new VM({
				timeout: 1000,
				sandbox: {
					data,
					context: data,
					ctx: data,
				},
			})
			const script = this.getConfig().script

			if ( ! script) return reject('No "script" given.')

			data.transform = vm.run('(function(){' + script + '})()')
			resolve()
		})
	}
}

TransformAction.key = 'transform'

module.exports = TransformAction
