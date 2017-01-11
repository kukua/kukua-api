const Sequelize = require('sequelize')
const Promise = require('bluebird')
const sequelize = require('../helpers/sequelize')('concava')
const { NotFoundError } = require('../helpers/errors')
const DeviceModel = require('../models/Device')
const DeviceLabel = require('./_DeviceLabel').SequelizeModel

var Device = sequelize.define('device', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	udid: {
		type: Sequelize.STRING(16),
		allowNull: false,
		set: function (val, key) {
			this.setDataValue(key, val.toLowerCase())
		},
		validate: {
			is: {
				args: /^[a-f0-9]{16}$/,
				msg: 'Device ID should be 16 hexadecimal characters',
			},
			notEmpty: true,
		},
	},
	template_id: Sequelize.INTEGER,
	name: Sequelize.STRING,
})

Device.hasMany(DeviceLabel, { as: 'labels' })
DeviceLabel.belongsTo(Device)

const isValidDeviceId = (id) => (typeof id === 'string' && id.match(/^[a-f0-9]{16}$/))

const locationLabels = ['altitude_meters', 'country', 'longitude', 'latitude', 'timezone']
const createModel = (device) => {
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

	return new DeviceModel(attr)
}

module.exports = {
	SequelizeModel: Device,

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
		}).then((devices) => {
			resolve(devices.map((device) => createModel(device)))
		}).catch(reject)
	}),
	findById: (id) => new Promise((resolve, reject) => {
		if ( ! isValidDeviceId(id)) return reject('Invalid device ID.')

		Device.findOne({
			where: {
				udid: id,
			},
			include: {
				model: DeviceLabel,
				as: 'labels',
				required: false,
			},
		}).then((device) => {
			if ( ! device) throw new NotFoundError()

			resolve(createModel(device))
		}).catch(reject)
	}),
}
