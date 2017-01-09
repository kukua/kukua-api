const Promise = require('bluebird')
const { VM } = require('vm2')
const Base = require('./Base')

class Transform extends Base {
	exec (data) {
		return new Promise((resolve, reject) => {
			const vm = new VM({
				timeout: 1000,
				sandbox: {
					data,
					ctx: data,
					context: data,
				},
			})
			const script = this.getConfig().script

			if ( ! script) return reject('No "script" given.')

			data.transform = vm.run('(function(){' + script + '})()')
			resolve()
		})
	}
}

Transform.key = 'transform'

module.exports = Transform
