const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const db = new Datastore({
	filename: path.resolve(process.env.GROUPS_DB_PATH),
	autoload: true,
	timestampData: true,
})
const slugify = require('underscore.string/slugify')
const humanize = require('underscore.string/humanize')
const DeviceModel = require('../models/Device')
const DeviceGroupModel = require('../models/DeviceGroup')

db.ensureIndex({ fieldName: 'id', unique: true }, (err) => {
	if (err) throw new Error(err)
})

const createModel = (group) => {
	var attributes = {
		id: group.id,
		name: group.name,
		device_udids: group.device_udids,
		created_at: group.createdAt,
		updated_at: group.updatedAt,
	}

	return new DeviceGroupModel(attributes)
}

module.exports = {
	find: () => new Promise((resolve, reject) => {
		db.find({}).sort({ name: 1 }).exec((err, groups) => {
			if (err) return reject(err)
			resolve(groups.map((group) => createModel(group)))
		})
	}),
	findByDevice: (device) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')

		db.find({ device_udids: device.id }, (err, groups) => {
			if (err) return reject(err)
			resolve(groups.map((group) => createModel(group)))
		})
	}),
	addDeviceToGroup: (device, groupId) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')
		if (slugify(groupId) !== groupId) return reject('Invalid groupId given (lowercase slug required).')

		db.update(
			{ id: groupId },
			{ $set: { name: humanize(groupId) }, $addToSet: { device_udids: device.id } },
			{ upsert: true },
			(err /*, numReplaced, group*/) => {
				if (err) return reject(err)
				resolve()
			}
		)
	}),
	removeDeviceFromGroup: (device, groupId) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')
		if (slugify(groupId) !== groupId) return reject('Invalid groupId given (lowercase slug required).')

		db.update(
			{ id: groupId },
			{ $set: { name: humanize(groupId) }, $pull: { device_udids: device.id } },
			{ upsert: true },
			(err /*, numReplaced, group*/) => {
				if (err) return reject(err)
				resolve()
			}
		)
	}),
}
