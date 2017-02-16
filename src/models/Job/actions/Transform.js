const Promise = require('bluebird')
const BaseAction = require('./Base')
const runInVM = require('../../../helpers/runInVM')

class TransformAction extends BaseAction {
	exec (data) {
		return new Promise((resolve, reject) => {
			try {
				data.transform = runInVM({
					script: this.getConfig().script,
					sandbox: {
						data,
						context: data,
						ctx: data,
					},
				})
				resolve()
			} catch (err) {
				reject(err)
			}
		})
	}
}

TransformAction.key = 'transform'

module.exports = TransformAction
