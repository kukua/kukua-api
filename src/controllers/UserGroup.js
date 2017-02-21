const _ = require('underscore')
const Promise = require('bluebird')
const BaseController = require('./Base')
const UserGroupModel = require('../models/UserGroup')
const { BadRequestError } = require('../helpers/errors')

class UserGroupController extends BaseController {
	constructor (app, providerFactory) {
		super(app, providerFactory)

		var auth = this._getProvider('auth')

		app.get('/userGroups', auth.middleware, this._onIndex.bind(this))
		app.get('/userGroups/:id([a-zA-Z0-9]+)', auth.middleware, this._onShow.bind(this))
		app.put('/userGroups/:id([a-zA-Z0-9]+)', auth.middleware, this._onUpdate.bind(this))
		app.delete('/userGroups/:id([a-zA-Z0-9]+)', auth.middleware, this._onRemove.bind(this))

		app.put(
			'/users/:userID(\\d+)/groups/:id([a-zA-Z0-9]+)',
			auth.middleware,
			this._onUserAdd.bind(this)
		)
		app.delete(
			'/users/:userID(\\d+)/groups/:id([a-zA-Z0-9]+)',
			auth.middleware,
			this._onUserRemove.bind(this)
		)

		app.put(
			'/userGroups/:id([a-zA-Z0-9]+)/permissions/:rule([a-zA-Z0-9\\.]+)/:permission(inherit|allow|deny)',
			auth.middleware,
			this._onPermissionUpdate.bind(this)
		)

		app.put(
			'/userGroups/:id([a-zA-Z0-9]+)/config/:configID([\\w\\.]+)',
			auth.middleware,
			this._onConfigUpdate.bind(this)
		)
		app.delete(
			'/userGroups/:id([a-zA-Z0-9]+)/config/:configID([\\w\\.]+)',
			auth.middleware,
			this._onConfigRemove.bind(this)
		)
	}

	_onIndex (req, res) {
		var user = req.session.user

		this._getProvider('userGroup').find()
			.then((groups) => Promise.all(
				groups.map((group) => {
					return this._canRead(user, group)
						.then(() => group, () => null) // Filter out prohibited
				})
			))
			.then((groups) => _.compact(groups))
			.then((groups) => this._addIncludes(req, groups))
			.then((groups) => res.json(groups))
			.catch((err) => res.error(err))
	}
	_onShow (req, res) {
		this._getProvider('userGroup').findByID(req.params.id)
			.then((group) => this._canRead(req.session.user, group))
			.then((group) => this._addIncludes(req, group))
			.then((group) => res.json(group))
			.catch((err) => res.error(err))
	}
	_onUpdate (req, res) {
		var group = new UserGroupModel({ id: req.params.id }, this._getProviderFactory())

		this._canUpdate(req.session.user, group)
			.then((group) => group.fill(req.body))
			.then((group) => this._getProvider('userGroup').update(group))
			.then((group) => res.json(group))
			.catch((err) => res.error(err))
	}
	_onRemove (req, res) {
		// TODO(mauvm): Also remove user group access control rights
		var provider = this._getProvider('userGroup')

		provider.findByID(req.params.id)
			.then((group) => this._canDelete(req.session.user, group))
			.then((group) => provider.remove(group))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}

	_onUserAdd (req, res) {
		var provider = this._getProvider('userGroup')

		Promise.all([
			this._getProvider('user').findByID(req.params.userID)
				.then((user) => this._canUpdate(req.session.user, user)),
			provider.findByID(req.params.id)
				.then((group) => this._canUpdate(req.session.user, group)),
		])
			.then(([ user, group ]) => provider.addUserToGroup(user, group))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	_onUserRemove (req, res) {
		var provider = this._getProvider('userGroup')

		Promise.all([
			this._getProvider('user').findByID(req.params.userID)
				.then((user) => this._canUpdate(req.session.user, user)),
			provider.findByID(req.params.id)
				.then((group) => this._canUpdate(req.session.user, group)),
		])
			.then(([ user, group ]) => provider.removeUserFromGroup(user, group))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}

	_onPermissionUpdate (req, res) {
		var accessControl = this._getProvider('accessControl')

		accessControl.can(req.session.user, 'acl.update.userGroup.' + req.params.id)
			.then(() => this._getProvider('userGroup').findByID(req.params.id))
			.then((group) => accessControl.setPermission(group, req.params.rule, req.params.permission))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}

	_onConfigUpdate (req, res) {
		var { value } = req.body
		if (value === undefined) throw new BadRequestError('No value provided.')
		var data = { value }

		this._getProvider('userGroup').findByID(req.params.id)
			.then((group) => this._canUpdate(req.session.user, group))
			.then((group) => this._getProvider('userGroupConfig').updateForGroup(group, req.params.configID, data))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
	_onConfigRemove (req, res) {
		this._getProvider('userGroup').findByID(req.params.id)
			.then((group) => this._canUpdate(req.session.user, group))
			.then((group) => this._getProvider('userGroupConfig').removeByGroupAndID(group, req.params.configID))
			.then(() => res.ok())
			.catch((err) => res.error(err))
	}
}

module.exports = UserGroupController
