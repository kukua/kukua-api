const path = require('path')
const _ = require('underscore')
const Promise = require('bluebird')
const Datastore = require('nedb')
const BaseProvider = require('./Base')
const UserModel  = require('../models/User')
const { UnauthorizedError } = require('../helpers/errors')

class AccessControlProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._UserModel = UserModel
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

	_createPrefix (user) {
		if ( ! (user instanceof this._UserModel)) {
			throw new Error('Invalid User model given.')
		}

		return `user.${user.id}:`
	}
	_createRule (user, rule) {
		if (Array.isArray(rule)) rule = rule.join('.')

		if ( ! rule.match(/^[a-zA-Z\d\.]+$/)) {
			throw new Error('Invalid rule given.')
		}

		return this._createPrefix(user) + rule
	}

	can (user, rule) {
		return new Promise((resolve, reject) => {
			var parts = rule.split('.')
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

				reject(new UnauthorizedError('Not allowed.'))
			})
		})
	}

	setPermission (user, rule, permission) {
		if (typeof permission === 'string') {
			permission = this._permissions[permission.toUpperCase()]
			if (permission === undefined) {
				return Promise.reject('Invalid permission.')
			}
		} else if (_.values(this._permissions).indexOf(permission) === -1) {
			return Promise.reject('Invalid permission.')
		}

		return new Promise((resolve, reject) => {
			var setPermission = () => {
				this._db.update(
					{ id: this._createRule(user, rule) },
					{ $set: { permission } },
					{ upsert: true },
					(err) => {
						if (err) return reject(err)
						this._empty = false
						resolve()
					}
				)
			}

			this.can(user, 'acl.setPermission.' + rule)
				// Allow setting permission if ACl is empty
				.then(setPermission, (this._empty ? setPermission : reject))
		})
	}
}

module.exports = AccessControlProvider
