const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const db = new Datastore({
	filename: path.resolve(process.env.USER_CONFIG_DB_PATH),
	autoload: true,
	timestampData: true,
})
const UserModel = require('../models/User')
const UserConfigModel = require('../models/UserConfig')

db.ensureIndex({ fieldName: 'id' }, (err) => {
	if (err) throw new Error(err)
})
db.ensureIndex({ fieldName: 'userId' }, (err) => {
	if (err) throw new Error(err)
})

const createModel = (item) => {
	var attr = {
		id: item.id,
		user_id: item.userId,
		value: item.value,
		created_at: item.createdAt,
		updated_at: item.updatedAt,
	}

	return new UserConfigModel(attr)
}
const createConfig = (items) => {
	var config = {}
	items.forEach((item) => config[item.id] = item)
	return config
}

module.exports = {
	findByUser: (user) => new Promise((resolve, reject) => {
		if ( ! (user instanceof UserModel)) return reject('Invalid User given.')

		db.find({ userId: user.id }, (err, items) => {
			if (err) return reject(err)
			resolve(createConfig(items.map((item) => createModel(item))))
		})
	}),
	updateForUser: (user, id, data) => new Promise((resolve, reject) => {
		if ( ! (user instanceof UserModel)) return reject('Invalid User given.')
		if (typeof id !== 'string') return reject('Invalid config key given.')
		if (typeof data !== 'object') return reject('Invalid data object given.')

		var userId = user.id

		db.update(
			{ id, userId },
			{ $set: {
				id,
				userId,
				value: data.value,
			} },
			{ upsert: true },
			(err /*, numReplaced, item*/) => {
				if (err) return reject(err)
				resolve()
			}
		)
	}),
	removeByUserAndId: (user, id) => new Promise((resolve, reject) => {
		if ( ! (user instanceof UserModel)) return reject('Invalid User given.')
		if (typeof id !== 'string') return reject('Invalid config key given.')

		db.remove(
			{ id, userId: user.id },
			{},
			(err /*, numRemoved*/) => {
				if (err) return reject(err)
				resolve()
			}
		)
	}),
}
