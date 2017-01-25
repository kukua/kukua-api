const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const BaseProvider = require('./Base')
const UserGroupModel = require('../models/UserGroup')
const UserModel = require('../models/User')
const { NotFoundError } = require('../helpers/errors')

class UserGroupProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._UserGroupModel = UserGroupModel
		this._UserModel = UserModel

		var filePath = path.resolve(process.env.USER_GROUP_DB_PATH)
		this.create(filePath)
	}

	create (filePath) {
		var db = this._db = new Datastore({
			filename: filePath,
			autoload: true,
			timestampData: true,
		})

		db.ensureIndex({ fieldName: 'id' }, (err) => {
			if (err) throw new Error(err)
		})
		db.ensureIndex({ fieldName: 'users' }, (err) => {
			if (err) throw new Error(err)
		})
	}

	_createModel (item) {
		var attr = {
			id: item.id,
			name: item.name,
			users: item.users,
			created_at: item.createdAt,
			updated_at: item.updatedAt,
		}

		return new (this._UserGroupModel)(attr, this._getProviderFactory())
	}

	find (options = {}) {
		return new Promise((resolve, reject) => {
			var where = {}

			if (Array.isArray(options.id)) {
				where.id = { $in: options.id }
			}

			this._db.find(where)
				.sort({ name: 1 })
				.exec((err, groups) => {
					if (err) return reject(err)
					resolve(groups.map((group) => this._createModel(group)))
				})
		})
	}
	findByID (id) {
		return new Promise((resolve, reject) => {
			this._db.findOne({ id }, (err, group) => {
				if (err) return reject(err)
				if ( ! group) return reject(new NotFoundError())
				resolve(this._createModel(group))
			})
		})
	}
	findByUser (user) {
		return new Promise((resolve, reject) => {
			if ( ! (user instanceof this._UserModel)) {
				return reject('Invalid user model.')
			}

			this._db.find({ users: user.id })
				.sort({ name: 1 })
				.exec((err, groups) => {
					if (err) return reject(err)
					resolve(groups.map((group) => this._createModel(group)))
				})
		})
	}
	update (group) {
		return new Promise((resolve, reject) => {
			if ( ! (group instanceof this._UserGroupModel)) {
				return reject('Invalid user group model.')
			}

			var data = group.toJSON()
			delete data.users

			this._db.update(
				{ id: group.id },
				{ $set: data },
				{ upsert: true },
				(err /*, numReplaced, item*/) => {
					if (err) return reject(err)
					this.findByID(group.id).then(resolve, reject)
				}
			)
		})
	}
	remove (group) {
		return new Promise((resolve, reject) => {
			if ( ! (group instanceof this._UserGroupModel)) {
				return reject('Invalid user group model.')
			}

			this._db.remove(
				{ id: group.id },
				{},
				(err /*, numRemoved*/) => {
					if (err) return reject(err)
					resolve()
				}
			)
		})
	}
	addUserToGroup (user, group) {
		return new Promise((resolve, reject) => {
			if ( ! (user instanceof this._UserModel)) {
				return reject('Invalid user model.')
			}
			if ( ! (group instanceof this._UserGroupModel)) {
				return reject('Invalid user group model.')
			}

			this._db.update(
				{ id: group.id },
				{ $addToSet: { users: user.id } },
				{ upsert: true },
				(err /*, numReplaced, group*/) => {
					if (err) return reject(err)
					resolve()
				}
			)
		})
	}
	removeUserFromGroup (user, group) {
		return new Promise((resolve, reject) => {
			if ( ! (user instanceof this._UserModel)) {
				return reject('Invalid user model.')
			}
			if ( ! (group instanceof this._UserGroupModel)) {
				return reject('Invalid user group model.')
			}

			this._db.update(
				{ id: group.id },
				{ $pull: { users: user.id } },
				{ upsert: true },
				(err /*, numReplaced, group*/) => {
					if (err) return reject(err)
					resolve()
				}
			)
		})
	}
}

module.exports = UserGroupProvider
