const Promise = require('bluebird')
const request = require('request')
const BaseAction = require('./Base')

class SlackHookAction extends BaseAction {
	exec (data) {
		return new Promise((resolve, reject) => {
			if (typeof data.transform !== 'string') {
				return reject('Hook requires transform that returns string.')
			}

			request.post({
				url: this.getConfig().url,
				body: {
					text: data.transform,
				},
				json: true,
			}, (err, res, body) => {
				if (err) return reject(err)
				if (res.statusCode < 200 || res.statusCode >= 300) {
					return reject(`Error in response (${res.statusCode}): ${body}`)
				}

				resolve()
			})
		})
	}
}

SlackHookAction.key = 'slack_hook'

module.exports = SlackHookAction
