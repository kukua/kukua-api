const _ = require('underscore')
const Promise = require('bluebird')
const BaseProvider = require('./Base')
const DeviceModel = require('../models/Device')
const { NotFoundError } = require('../helpers/errors')

class DeviceProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._locationLabels = ['altitude_meters', 'country', 'longitude', 'latitude', 'timezone']
		this._DeviceModel = DeviceModel

		var sequelizeModel = this._getProvider('sequelizeModel')
		this._Device = sequelizeModel.getModel('Device')
		this._DeviceLabel = sequelizeModel.getModel('DeviceLabel')
	}

	_createModel (device) {
		var attr = device.get()

		attr.id = attr.udid
		delete attr.udid

		// Labels
		attr.location = {}

		var labels = {}
		attr.labels.forEach((label) => {
			var key = label.key, value = null

			try {
				value = JSON.parse(label.value)
			} catch (ex) { /* Do nothing */ }

			if (key === 'altitude') key = 'altitude_meters'

			labels[key] = value
		})

		this._locationLabels.forEach((key) => {
			attr.location[key] = (labels[key] !== undefined ? labels[key] : null)
		})

		delete attr.labels

		return new (this._DeviceModel)(attr, this._getProviderFactory())
	}

	isValidID (id) {
		return (typeof id === 'string' && id.match(/^[a-f0-9]{16}$/))
	}
	getRequestedIDs (req) {
		// &devices=abcdef0123456789,...
		return _.chain((req.query.devices || '').split(','))
			.map((id) => id.toLowerCase())
			// Also removes empty values, since ''.split(',') => ['']
			.filter((id) => id.match(/^[a-f0-9]{16}$/))
			.uniq()
			.value()
	}
	getAllIDs () {
		return new Promise((resolve, reject) => {
			this._Device.findAll({
				attributes: ['udid'],
			})
				.then((devices) => devices.map((device) => device.udid))
				.then(resolve)
				.catch(reject)
		})
	}
	find (options = {}) {
		return new Promise((resolve, reject) => {
			var where = {}

			if (Array.isArray(options.id)) {
				where.udid = { $in: options.id }
			}
			if (typeof options.template_id === 'number') {
				where.template_id = options.template_id
			}

			this._Device.findAll({
				where,
				include: {
					model: this._DeviceLabel,
					as: 'labels',
					required: false,
				},
			})
				.then((devices) => devices.map((device) => this._createModel(device)))
				.then(resolve)
				.catch(reject)
		})
	}
	findByID (id) {
		return new Promise((resolve, reject) => {
			if ( ! this.isValidID(id)) {
				return reject('Invalid device ID.')
			}

			this._Device.findOne({
				where: {
					udid: id,
				},
				include: {
					model: this._DeviceLabel,
					as: 'labels',
					required: false,
				},
			})
				.then((device) => {
					if ( ! device) throw new NotFoundError()
					return this._createModel(device)
				})
				.then(resolve)
				.catch(reject)
		})
	}
}

module.exports = DeviceProvider
