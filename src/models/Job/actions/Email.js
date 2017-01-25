const Promise = require('bluebird')
const BaseAction = require('./Base')
const Validator = require('../../../helpers/validator')
const objectTemplate = require('../../../helpers/objectTemplate')
const Mailgun = require('mailgun-js')({
	apiKey: process.env.MAILGUN_API_KEY,
	domain: process.env.MAILGUN_DOMAIN,
})

class EmailAction extends BaseAction {
	getSchema () {
		return {
			from: 'required|email',
			to: 'required|email',
			subject: 'required|string',
			text: 'string',
		}
	}

	exec (data) {
		return new Promise((resolve, reject) => {
			var config = this.getConfig()
			var validator = new Validator(config, this.getSchema())

			if (validator.fails()) {
				return reject('Invalid Email config: ' + validator.errors.all()[0])
			}

			var { from, to, subject, text } = config

			subject = objectTemplate(subject, data)

			if (text) {
				text = objectTemplate(text, data)
			} else if (data.transform && typeof data.transform === 'string') {
				text = data.transform
			} else {
				return reject('No "text" config or "transform" string value.')
			}

			Mailgun.messages().send({ from, to, subject, text }, (err) => {
				if (err) return reject(err)
				resolve()
			})
		})
	}
}

EmailAction.key = 'email'

module.exports = EmailAction
