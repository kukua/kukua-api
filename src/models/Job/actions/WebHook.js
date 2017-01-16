const Promise = require('bluebird')
const request = require('request')
const BaseAction = require('./Base')
const objectTemplate = require('../../../helpers/objectTemplate')

class WebHookAction extends BaseAction {
	exec (data) {
		return new Promise((resolve, reject) => {
			var config = Object.assign({}, this.getConfig())

			if ( ! config.url && ! config.uri) return reject('No URL/URI specified.')
			if ( ! config.method) config.method = 'POST'

			config = objectTemplate(config, data)

			request(config, (err, res, body) => {
				if (err) return reject(err)
				if (res.statusCode !== 200) {
					return reject(`Error in response (${res.statusCode}): ${body}`)
				}

				resolve()
			})
		})
	}
}

WebHookAction.key = 'web_hook'

module.exports = WebHookAction
