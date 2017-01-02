const bodyParser = require('body-parser')
const auth = require('../helpers/authenticate')
const User = require('../models/User')
const addIncludes = require('../helpers/addIncludes')
const UserConfig = require('../models/UserConfig')
const { BadRequestError, NotFoundError } = require('../helpers/errors')

module.exports = class UserController {
	constructor (app, log) {
		this._log = log

		app.get('/users/:id(\\d+)', auth(true), this.onShow.bind(this))
		app.put('/users/:id(\\d+)/config/:configId([\\w\\.]+)', auth(true), bodyParser.json(), this.onUpdate.bind(this))
		app.delete('/users/:id(\\d+)/config/:configId([\\w\\.]+)', auth(true), this.onRemove.bind(this))
	}

	onShow (req, res) {
		User.findById(req.params.id).then((user) => {
			return addIncludes(req, user)
		}).then((user) => {
			res.json(user)
		}).catch(NotFoundError, () => { res.status(404).error('User not found.')
		}).catch((err) => { res.error(err) })
	}
	onUpdate (req, res) {
		User.findById(req.params.id).then((user) => {
			var { value } = req.body

			if (value === undefined) {
				throw new BadRequestError('No value provided.')
			}

			var data = { value }
			return UserConfig.updateForUser(user, req.params.configId, data)
		}).then(() => {
			res.ok()
		}).catch(BadRequestError, (err) => { res.status(400).error(err)
		}).catch(NotFoundError, () => { res.status(404).error('User not found.')
		}).catch((err) => { res.error(err) })
	}
	onRemove (req, res) {
		User.findById(req.params.id).then((user) => {
			return UserConfig.removeByUserAndId(user, req.params.configId)
		}).then(() => {
			res.ok()
		}).catch(NotFoundError, () => { res.status(404).error('User not found.')
		}).catch((err) => { res.error(err) })
	}
}
