const Sequelize = require('sequelize')
const Promise = require('bluebird')
const sequelize = require('../helpers/sequelize')
const DeviceModel = require('../models/Device')
const { NotFoundError } = require('../helpers/errors')

var Device = sequelize('concava').define('device', {
	udid: {
		type: Sequelize.STRING(16),
		allowNull: false,
		primaryKey: true,
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
})

module.exports = {
	find: () => new Promise((resolve, reject) => {
		Device.findAll().then((devices) => {
			resolve(devices.map((device) => new DeviceModel(device.get())))
		}).catch((err) => reject(err))
	}),
	findByUDID: (udid) => new Promise((resolve, reject) => {
		Device.findOne({ where: { udid: ('' + udid).toLowerCase() } }).then((device) => {
			if ( ! device) throw new NotFoundError()

			resolve(new DeviceModel(device.get()))
		}).catch((err) => reject(err))
	}),
}
