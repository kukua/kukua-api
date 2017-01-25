const path = require('path')
const _ = require('underscore')
const humanize = require('underscore.string/humanize')
const Promise = require('bluebird')
const Datastore = require('nedb')
const BaseProvider = require('./Base')
const UserModel  = require('../models/User')
const UserGroupModel  = require('../models/UserGroup')
const { BadRequestError, UnauthorizedError } = require('../helpers/errors')

class AccessControlProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._UserModel = UserModel
		this._UserGroupModel = UserGroupModel
		this._permissions = {
			INHERIT: 0,
			ALLOW: 1,
			DENY: 2,
		}

		var filePath = path.resolve(process.env.ACL_DB_PATH)
		this.create(filePath)
	}

	create (filePath) {
		var db = this._db = new Datastore({
			filename: filePath,
			autoload: true,
			timestampData: true,
		})

		db.ensureIndex({ fieldName: 'id', unique: true }, (err) => {
			if (err) throw new Error(err)
		})

		db.count({}, (err, count) => {
			if (err) throw new Error(err)
			this._empty = (count === 0)
		})
	}
	isEmpty () {
		return !! this._empty
	}

	_createPrefix (model) {
		if (model instanceof this._UserModel || model instanceof this._UserGroupModel) {
			return `${model.key}.${model.id}:`
		}

		throw new Error('Invalid User or UserGroup model.')
	}
	_createRule (model, rule) {
		if (Array.isArray(rule)) rule = rule.join('.')

		if ( ! rule.match(/^[a-zA-Z\d\.]+$/)) {
			throw new Error('Invalid rule.')
		}

		return this._createPrefix(model) + rule
	}
	_splitRule (rule) {
		var [ entity, method ] = rule.split('.', 2)
		var parts = [ entity, method ]
		var id = rule.substr(entity.length + 1 /* dot */ + method.length + 1 /* dot */)
		parts.push(id)
		return parts
	}

	can (user, rule) {
		if ( ! (user instanceof this._UserModel)) {
			return Promise.reject(new BadRequestError('Invalid User model.'))
		}

		return new Promise((resolve, reject) => {
			var parts = this._splitRule(rule)
			var rules = {}
			var { INHERIT, ALLOW, DENY } = this._permissions

			while (parts.length > 0) {
				rules[this._createRule(user, parts)] = INHERIT
				parts.pop()
			}

			this._db.find({
				id: { $in: Object.keys(rules) },
			}, (err, items) => {
				items.forEach((item) => rules[item.id] = item.permission)

				var keys = Object.keys(rules)

				for (var key of keys) {
					if (rules[key] === ALLOW) {
						return resolve()
					}
					if (rules[key] === DENY) {
						break
					}
				}

				var [ entity, method, id ] = this._splitRule(rule)
				entity = humanize(entity).toLowerCase()
				method = humanize(method).toLowerCase()
				reject(new UnauthorizedError(
					'Not allowed.',
					[
						`No permission to ${method} ${entity} "${id}".`
					]
				))
			})
		})
	}

	setPermission (model, rule, permission) {
		if (typeof permission === 'string') {
			permission = this._permissions[permission.toUpperCase()]
			if (permission === undefined) {
				return Promise.reject(new BadRequestError('Invalid permission.'))
			}
		} else if (_.values(this._permissions).indexOf(permission) === -1) {
			return Promise.reject(new BadRequestError('Invalid permission.'))
		}

		return new Promise((resolve, reject) => {
			this._db.update(
				{ id: this._createRule(model, rule) },
				{ $set: { permission } },
				{ upsert: true },
				(err) => {
					if (err) return reject(err)
					this._empty = false
					resolve()
				}
			)
		})
	}
}

module.exports = AccessControlProvider
