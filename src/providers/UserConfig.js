const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const BaseProvider = require('./Base')
const UserConfigModel = require('../models/UserConfig')
const UserModel = require('../models/User')

class UserConfigProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._UserConfigModel = UserConfigModel
		this._UserModel = UserModel

		var filePath = path.resolve(process.env.USER_CONFIG_DB_PATH)
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
		db.ensureIndex({ fieldName: 'userID' }, (err) => {
			if (err) throw new Error(err)
		})
	}

	_createModel (item) {
		var attr = {
			id: item.id,
			user_id: item.userID,
			value: item.value,
			created_at: item.createdAt,
			updated_at: item.updatedAt,
		}

		return new (this._UserConfigModel)(attr, this._getProviderFactory())
	}
	_createConfig (items) {
		var config = {}
		items.forEach((item) => config[item.id] = item)
		return config
	}

	findByUser (user) {
		return new Promise((resolve, reject) => {
			if ( ! (user instanceof this._UserModel)) {
				return reject('Invalid user model.')
			}

			this._db.find({ userID: user.id }, (err, items) => {
				if (err) return reject(err)
				resolve(this._createConfig(items.map((item) => this._createModel(item))))
			})
		})
	}
	updateForUser (user, id, data) {
		return new Promise((resolve, reject) => {
			if ( ! (user instanceof this._UserModel)) {
				return reject('Invalid user modek.')
			}
			if (typeof id !== 'string') {
				return reject('Invalid config key.')
			}
			if (typeof data !== 'object') {
				return reject('Invalid data object.')
			}

			var userID = user.id

			this._db.update(
				{ id, userID },
				{ $set: {
					id,
					userID,
					value: data.value,
				} },
				{ upsert: true },
				(err /*, numReplaced, item*/) => {
					if (err) return reject(err)
					resolve()
				}
			)
		})
	}
	removeByUserAndID (user, id) {
		return new Promise((resolve, reject) => {
			if ( ! (user instanceof this._UserModel)) {
				return reject('Invalid user model.')
			}
			if (typeof id !== 'string') {
				return reject('Invalid config key.')
			}

			this._db.remove(
				{ id, userID: user.id },
				{},
				(err /*, numRemoved*/) => {
					if (err) return reject(err)
					resolve()
				}
			)
		})
	}
}

module.exports = UserConfigProvider
