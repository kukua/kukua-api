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
		devices: group.devices,
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
	findById: (id) => new Promise((resolve, reject) => {
		if (slugify(id) !== id) return reject('Invalid group ID given (lowercase slug required).')

		db.findOne({ id }).sort({ name: 1 }).exec((err, group) => {
			if (err) return reject(err)
			resolve(createModel(group))
		})
	}),
	findByDevice: (device) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')

		db.find({ devices: device.id }, (err, groups) => {
			if (err) return reject(err)
			resolve(groups.map((group) => createModel(group)))
		})
	}),
	addDeviceToGroup: (device, id) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')
		if (slugify(id) !== id) return reject('Invalid group ID given (lowercase slug required).')

		db.update(
			{ id },
			{ $set: { name: humanize(id) }, $addToSet: { devices: device.id } },
			{ upsert: true },
			(err /*, numReplaced, group*/) => {
				if (err) return reject(err)
				resolve()
			}
		)
	}),
	removeDeviceFromGroup: (device, id) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')
		if (slugify(id) !== id) return reject('Invalid group ID given (lowercase slug required).')

		db.update(
			{ id },
			{ $set: { name: humanize(id) }, $pull: { devices: device.id } },
			{ upsert: true },
			(err /*, numReplaced, group*/) => {
				if (err) return reject(err)
				resolve()
			}
		)
	}),
}
