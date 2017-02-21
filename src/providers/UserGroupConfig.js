const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const BaseProvider = require('./Base')
const UserGroupConfigModel = require('../models/UserGroupConfig')
const UserGroupModel = require('../models/UserGroup')

const invalidFieldName = 'Field names cannot begin with the $ character'

class UserGroupConfigProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._UserGroupConfigModel = UserGroupConfigModel
		this._UserGroupModel = UserGroupModel

		var filePath = path.resolve(process.env.USER_GROUP_CONFIG_DB_PATH)
		this._createDB(filePath)
	}

	_createDB (filePath) {
		var db = this._db = new Datastore({
			filename: filePath,
			autoload: true,
			timestampData: true,
		})

		db.ensureIndex({ fieldName: 'id' }, (err) => {
			if (err) throw new Error(err)
		})
		db.ensureIndex({ fieldName: 'groupID' }, (err) => {
			if (err) throw new Error(err)
		})
	}

	_createModel (item) {
		var attr = {
			id: item.id,
			user_group_id: item.groupID,
			value: (item.serialized ? JSON.parse(item.value) : item.value),
			created_at: item.createdAt,
			updated_at: item.updatedAt,
		}

		return new (this._UserGroupConfigModel)(attr, this._getProviderFactory())
	}
	_createConfig (items) {
		var config = {}
		items.forEach((item) => config[item.id] = item)
		return config
	}

	findByGroup (group, options = {}) {
		return new Promise((resolve, reject) => {
			if ( ! (group instanceof this._UserGroupModel)) {
				return reject('Invalid user group model.')
			}

			var where = { groupID: group.id }

			if (typeof options.id === 'string' || Array.isArray(options.id)) {
				where.id = options.id
			}

			this._db.find(where, (err, items) => {
				if (err) return reject(err)
				resolve(this._createConfig(items.map((item) => this._createModel(item))))
			})
		})
	}
	updateForGroup (group, id, data) {
		return new Promise((resolve, reject) => {
			if ( ! (group instanceof this._UserGroupModel)) {
				return reject('Invalid user group model.')
			}
			if (typeof id !== 'string') {
				return reject('Invalid config key.')
			}
			if (typeof data !== 'object') {
				return reject('Invalid data object.')
			}

			var groupID = group.id

			this._db.update(
				{ id, groupID },
				{ $set: {
					id,
					groupID,
					value: data.value,
					serialized: data.serialized,
				} },
				{ upsert: true },
				(err /*, numReplaced, item*/) => {
					if (err && err.message === invalidFieldName && ! data.serialized) {
						// Serialize and try again
						data.value = JSON.stringify(data.value)
						data.serialized = true
						this.updateForGroup(group, id, data).then(resolve, reject)
						return
					}
					if (err) return reject(err)
					resolve()
				}
			)
		})
	}
	removeByGroupAndID (group, id) {
		return new Promise((resolve, reject) => {
			if ( ! (group instanceof this._UserGroupModel)) {
				return reject('Invalid user group model.')
			}
			if (typeof id !== 'string') {
				return reject('Invalid config key.')
			}

			this._db.remove(
				{ id, groupID: group.id },
				{},
				(err /*, numRemoved*/) => {
					if (err) return reject(err)
					resolve()
				}
			)
		})
	}
}

module.exports = UserGroupConfigProvider
