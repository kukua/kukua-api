const path = require('path')
const _ = require('underscore')
const Promise = require('bluebird')
const Datastore = require('nedb')
const BaseProvider = require('./Base')
const DeviceGroupModel = require('../models/DeviceGroup')
const DeviceModel = require('../models/Device')
const { NotFoundError } = require('../helpers/errors')

class DeviceGroupProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._DeviceGroupModel = DeviceGroupModel
		this._DeviceModel = DeviceModel

		var filePath = path.resolve(process.env.DEVICE_GROUPS_DB_PATH)
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
	}

	_createModel (group) {
		var attr = {
			id: group.id,
			name: group.name,
			devices: group.devices,
			created_at: group.createdAt,
			updated_at: group.updatedAt,
		}

		return new (this._DeviceGroupModel)(attr, this._getProviderFactory())
	}

	getRequestedIDs (req) {
		// &device_groups=country1,country2,...
		return _.chain((req.query.deviceGroups || req.query.groups || '').split(','))
			.map((id) => id.toLowerCase())
			// Also removes empty values, since ''.split(',') => ['']
			.filter((id) => id.match(/^[\da-z\-]+$/))
			.uniq()
			.value()
	}
	getDeviceIDs (groups, deviceIDs) {
		return _.chain(groups)
			.map((group) => group.get('devices'))
			.flatten()
			.concat(deviceIDs) // Add other
			.uniq()
			.value()
	}
	getAllIDs () {
		return new Promise((resolve, reject) => {
			this._db.find({})
				.sort({ name: 1 })
				.exec((err, groups) => {
					if (err) return reject(err)
					resolve(groups.map((group) => group.id))
				})
		})
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
			if (typeof id !== 'string') {
				return reject('Invalid group ID.')
			}

			this._db.findOne({ id }, (err, group) => {
				if (err) return reject(err)
				if ( ! group) return reject(new NotFoundError())
				resolve(this._createModel(group))
			})
		})
	}
	findByDevice (device) {
		return new Promise((resolve, reject) => {
			if ( ! (device instanceof this._DeviceModel)) {
				return reject('Invalid device model.')
			}

			this._db.find({ devices: device.id }, (err, groups) => {
				if (err) return reject(err)
				resolve(groups.map((group) => this._createModel(group)))
			})
		})
	}
	update (group) {
		return new Promise((resolve, reject) => {
			if ( ! (group instanceof this._DeviceGroupModel)) {
				return reject('Invalid device group model.')
			}

			var data = group.toJSON()
			delete data.devices

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
			if ( ! (group instanceof this._DeviceGroupModel)) {
				return reject('Invalid device group model.')
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
	addDeviceToGroup (device, group) {
		return new Promise((resolve, reject) => {
			if ( ! (device instanceof this._DeviceModel)) {
				return reject('Invalid device model.')
			}
			if ( ! (group instanceof this._DeviceGroupModel)) {
				return reject('Invalid device group model.')
			}

			this._db.update(
				{ id: group.id },
				{ $addToSet: { devices: device.id } },
				{ upsert: true },
				(err /*, numReplaced, group*/) => {
					if (err) return reject(err)
					resolve()
				}
			)
		})
	}
	removeDeviceFromGroup (device, group) {
		return new Promise((resolve, reject) => {
			if ( ! (device instanceof this._DeviceModel)) {
				return reject('Invalid device model.')
			}
			if ( ! (group instanceof this._DeviceGroupModel)) {
				return reject('Invalid device group model.')
			}

			this._db.update(
				{ id: group.id },
				{ $pull: { devices: device.id } },
				{ upsert: true },
				(err /*, numReplaced, group*/) => {
					if (err) return reject(err)
					resolve()
				}
			)
		})
	}
}

module.exports = DeviceGroupProvider
