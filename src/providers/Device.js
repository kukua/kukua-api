const Sequelize = require('sequelize')
const Promise = require('bluebird')
const sequelize = require('../helpers/sequelize')
const DeviceModel = require('../models/Device')
const { NotFoundError } = require('../helpers/errors')
const DeviceLabel = require('./DeviceLabel').Model

var Device = sequelize('concava').define('device', {
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
	name: Sequelize.STRING,
})

Device.hasMany(DeviceLabel, { as: 'labels' })
DeviceLabel.belongsTo(Device)

const labelsToAttributes = ['altitude', 'country', 'longitude', 'latitude', 'timezone']
const createModel = (device) => {
	var attributes = device.get()

	labelsToAttributes.forEach((key) => attributes[key] = null)
	attributes.labels.forEach((label) => {
		if (labelsToAttributes.indexOf(label.key) === -1) return

		try {
			attributes[label.key] = JSON.parse(label.value)
		} catch (ex) { /* Ignore */ }
	})

	delete attributes.id
	delete attributes.labels

	return new DeviceModel(attributes)
}

module.exports = {
	Model: Device,

	find: (options = {}) => new Promise((resolve, reject) => {
		var where = {}

		if (Array.isArray(options.udid)) {
			where.udid = { $in: options.udid }
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
		}).catch((err) => reject(err))
	}),
	findByUDID: (udid) => new Promise((resolve, reject) => {
		Device.findOne({
			where: {
				udid: ('' + udid).toLowerCase(),
			},
			include: {
				model: DeviceLabel,
				as: 'labels',
				required: false,
			},
		}).then((device) => {
			if ( ! device) throw new NotFoundError()

			resolve(createModel(device))
		}).catch((err) => reject(err))
	}),
}
