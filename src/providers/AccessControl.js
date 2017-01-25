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

		// Least permission must have highest value, see _hasPermission method
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
	_splitRule (rule, splitID = false) {
		if (splitID) {
			return rule.split('.')
		}

		var [ entity = '', method = '' ] = rule.split('.', 2)
		var parts = [ entity, method ]
		var id = rule.substr(entity.length + 1 /* dot */ + method.length + 1 /* dot */)
		parts.push(id)
		return parts
	}
	_createRules (model, rule) {
		var parts = this._splitRule(rule, true)
		var rules = []

		while (parts.length > 0) {
			rules.push(this._createRule(model, parts))
			parts.pop()
		}

		return rules
	}
	_hasPermission (allRules, rights) {
		// Each sub array of rules will be evaluated as a single permission check,
		// if it evaluates so something other than INHERIT it will return the value
		var { INHERIT, ALLOW, DENY } = this._permissions

		// Create rights id => permission object
		rights = _.object(rights.map((right) => right.id), rights.map((right) => right.permission))

		for (var rules of allRules) {
			// Max can be used here because DENY=2, ALLOW=1, and INHERIT=0
			var permission = _.max(rules.map((rule) => (rights[rule] !== undefined ? rights[rule] : INHERIT)))

			if (permission === ALLOW) return true
			if (permission === DENY) return false
		}

		return false
	}

	can (user, rule) {
		if ( ! (user instanceof this._UserModel)) {
			return Promise.reject(new BadRequestError('Invalid User model.'))
		}

		return new Promise((resolve, reject) => {
			this._getProvider('userGroup').findByUser(user)
				.then((groups) => {
					var rules = [
						// Check all user permissions first
						this._createRules(user, rule),
						// Then each permission for all groups
						..._.unzip(groups.map((group) => this._createRules(group, rule))),
					]

					// Fetch rights
					this._db.find({
						id: { $in: _.flatten(rules) },
					}, (err, rights) => {
						if ( ! this._hasPermission(rules, rights)) {
							var [ entity, method, id ] = this._splitRule(rule)
							entity = humanize(entity).toLowerCase()
							method = humanize(method).toLowerCase()
							return reject(new UnauthorizedError(
								'Not allowed.',
								[`No permission to ${method} ${entity} "${id}".`]
							))
						}

						resolve()
					})
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
