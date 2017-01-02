const path = require('path')
const Promise = require('bluebird')
const Datastore = require('nedb')
const db = new Datastore({
	filename: path.resolve(process.env.DEVICE_GROUPS_DB_PATH),
	autoload: true,
	timestampData: true,
})
const DeviceGroupModel = require('../models/DeviceGroup')
const DeviceModel = require('../models/Device')
const slugify = require('underscore.string/slugify')
const humanize = require('underscore.string/humanize')

db.ensureIndex({ fieldName: 'id', unique: true }, (err) => {
	if (err) throw new Error(err)
})

const createModel = (group) => {
	var attr = {
		id: group.id,
		name: group.name,
		device_udids: group.deviceUDIDs,
		created_at: group.createdAt,
		updated_at: group.updatedAt,
	}

	return new DeviceGroupModel(attr)
}

module.exports = {
	find: () => new Promise((resolve, reject) => {
		db.find({}).sort({ name: 1 }).exec((err, groups) => {
			if (err) return reject(err)
			resolve(groups.map((group) => createModel(group)))
		})
	}),
	findById: (groupId) => new Promise((resolve, reject) => {
		if (slugify(groupId) !== groupId) return reject('Invalid groupId given (lowercase slug required).')

		db.find({ id: groupId }).sort({ name: 1 }).exec((err, groups) => {
			if (err) return reject(err)
			resolve(groups.map((group) => createModel(group)))
		})
	}),
	findByDevice: (device) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')

		db.find({ deviceUDIDs: device.id }, (err, groups) => {
			if (err) return reject(err)
			resolve(groups.map((group) => createModel(group)))
		})
	}),
	addDeviceToGroup: (device, groupId) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')
		if (slugify(groupId) !== groupId) return reject('Invalid groupId given (lowercase slug required).')

		db.update(
			{ id: groupId },
			{ $set: { name: humanize(groupId) }, $addToSet: { deviceUDIDs: device.id } },
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
			{ $set: { name: humanize(groupId) }, $pull: { deviceUDIDs: device.id } },
			{ upsert: true },
			(err /*, numReplaced, group*/) => {
				if (err) return reject(err)
				resolve()
			}
		)
	}),
}
