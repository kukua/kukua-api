const BaseController = require('./Base')
const { BadRequestError } = require('../helpers/errors')

class UserController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')

		app.get('/users/login', this._onLogin.bind(this))
		app.get('/users/:id(\\d+)', auth.middleware, this._onShow.bind(this))
		app.put(
			'/users/:id(\\d+)/permission/:rule([a-zA-Z\\d\\.]+)/:permission(inherit|allow|deny)',
			auth.middleware,
			this._onPermissionUpdate.bind(this)
		)
		app.put(
			'/users/:id(\\d+)/config/:configID([\\w\\.]+)',
			auth.middleware,
			this._onConfigUpdate.bind(this)
		)
		app.delete(
			'/users/:id(\\d+)/config/:configID([\\w\\.]+)',
			auth.middleware,
			this._onConfigRemove.bind(this)
		)
	}

	_onLogin (req, res) {
		var header = req.headers.authorization

		if ( ! header || ! header.toLowerCase().startsWith('basic ')) {
			return res.status(401).error('Missing Basic authentication header.')
		}

		var token = header.replace(/^basic\s+|\s*$/gi, '')
		var [username, password] = Buffer(token, 'base64').toString().split(':', 2)

		this._getProvider('user').findByCredentials(username, password)
			.then((user) => {
				if ( ! this._getProvider('auth').loginUser(req, res, user)) return
				res.json(user)
			})
			.catch((err) => res.error(err))
	}
	_onShow (req, res) {
		this._getProvider('user').findByID(req.params.id)
			.then((user) => this._canRead(req.session.user, user))
			.then((user) => this._addIncludes(req, user))
			.then((user) => res.json(user))
			.catch((err) => res.error(err))
	}
	_onPermissionUpdate (req, res) {
		this._getProvider('user').findByID(req.params.id)
			.then((user) => this._getProvider('accessControl')
				.setPermission(user, req.params.rule, req.params.permission)
			)
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	_onConfigUpdate (req, res) {
		var { value } = req.body
		if (value === undefined) throw new BadRequestError('No value provided.')
		var data = { value }

		this._getProvider('user').findByID(req.params.id)
			.then((user) => this._canUpdate(req.session.user, user))
			.then((user) => this._getProvider('userConfig').updateForUser(user, req.params.configID, data))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	_onConfigRemove (req, res) {
		this._getProvider('user').findByID(req.params.id)
			.then((user) => this._canUpdate(req.session.user, user))
			.then((user) => this._getProvider('userConfig').removeByUserAndID(user, req.params.configID))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
}

module.exports = UserController
