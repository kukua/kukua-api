const _ = require('underscore')
const Promise = require('bluebird')
const providers = require('./')
const DeviceModel = require('../models/Device')
const { Device, DeviceLabel } = require('./sequelizeModels/')
const { NotFoundError } = require('../helpers/errors')

const isValidId = (id) => (typeof id === 'string' && id.match(/^[a-f0-9]{16}$/))

const locationLabels = ['altitude_meters', 'country', 'longitude', 'latitude', 'timezone']

const methods = {
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

		locationLabels.forEach((key) => attr.location[key] = labels[key])

		delete attr.labels

		return new DeviceModel(attr, providers)
	},
	getRequestedIds (req) {
		// &devices=abcdef0123456789,...
		return _.chain((req.query.devices || '').split(','))
			.map((id) => id.toLowerCase())
			// Also removes empty values, since ''.split(',') => ['']
			.filter((id) => id.match(/^[a-f0-9]{16}$/))
			.uniq()
			.value()
	},
	find: (options = {}) => new Promise((resolve, reject) => {
		var where = {}

		if (Array.isArray(options.id)) {
			where.udid = { $in: options.id }
		}
		if (typeof options.template_id === 'number') {
			where.template_id = options.template_id
		}

		Device.findAll({
			where,
			include: {
				model: DeviceLabel,
				as: 'labels',
				required: false,
			},
		})
			.then((devices) => devices.map((device) => methods._createModel(device)))
			.then(resolve)
			.catch(reject)
	}),
	findById: (id) => new Promise((resolve, reject) => {
		if ( ! isValidId(id)) return reject('Invalid device ID.')

		Device.findOne({
			where: {
				udid: id,
			},
			include: {
				model: DeviceLabel,
				as: 'labels',
				required: false,
			},
		})
			.then((device) => {
				if ( ! device) throw new NotFoundError()
				return methods._createModel(device)
			})
			.then(resolve)
			.catch(reject)
	}),
}

module.exports = methods
