const auth = require('../helpers/authenticate')
const User = require('../models/User')
const addIncludes = require('../helpers/addIncludes')
const UserConfig = require('../models/UserConfig')
const { BadRequestError } = require('../helpers/errors')

module.exports = class UserController {
	constructor (app) {
		app.get('/users/login', this.onLogin.bind(this))
		app.get('/users/:id(\\d+)', auth(true), this.onShow.bind(this))
		app.put('/users/:id(\\d+)/config/:configId([\\w\\.]+)', auth(true), this.onConfigUpdate.bind(this))
		app.delete('/users/:id(\\d+)/config/:configId([\\w\\.]+)', auth(true), this.onConfigRemove.bind(this))
	}

	onLogin (req, res) {
		var header = req.headers.authorization

		if ( ! header || ! header.toLowerCase().startsWith('basic ')) {
			return res.status(401).error('Missing Basic authentication header.')
		}

		var token = header.replace(/^basic\s+/i, '')
		var [username, password] = Buffer(token, 'base64').toString().split(':', 2)

		User.findByCredentials(username, password)
			.then((user) => {
				if ( ! auth.loginUser(req, res, user)) return

				res.json(user)
			})
			.catch((err) => res.error(err))
	}
	onShow (req, res) {
		User.findById(req.params.id)
			.then((user) => addIncludes(req, user))
			.then((user) => res.json(user))
			.catch((err) => res.error(err))
	}
	onConfigUpdate (req, res) {
		var { value } = req.body
		if (value === undefined) throw new BadRequestError('No value provided.')
		var data = { value }

		User.findById(req.params.id)
			.then((user) => UserConfig.updateForUser(user, req.params.configId, data))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	onConfigRemove (req, res) {
		User.findById(req.params.id)
			.then((user) => UserConfig.removeByUserAndId(user, req.params.configId))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
}
