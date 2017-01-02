const auth = require('../helpers/authenticate')
const User = require('../models/User')
const addIncludes = require('../helpers/addIncludes')
const UserConfig = require('../models/UserConfig')
const { BadRequestError } = require('../helpers/errors')

module.exports = class UserController {
	constructor (app) {
		app.get('/users/:id(\\d+)', auth(true), this.onShow.bind(this))
		app.put('/users/:id(\\d+)/config/:configId([\\w\\.]+)', auth(true), this.onUpdate.bind(this))
		app.delete('/users/:id(\\d+)/config/:configId([\\w\\.]+)', auth(true), this.onRemove.bind(this))
	}

	onShow (req, res) {
		User.findById(req.params.id)
			.then((user) => addIncludes(req, user))
			.then((user) => res.json(user))
			.catch((err) => res.error(err))
	}
	onUpdate (req, res) {
		var { value } = req.body
		if (value === undefined) throw new BadRequestError('No value provided.')
		var data = { value }

		User.findById(req.params.id)
			.then((user) => UserConfig.updateForUser(user, req.params.configId, data))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	onRemove (req, res) {
		User.findById(req.params.id)
			.then((user) => UserConfig.removeByUserAndId(user, req.params.configId))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
}
