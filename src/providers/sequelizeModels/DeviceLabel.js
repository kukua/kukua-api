const Sequelize = require('sequelize')
const providers = require('../')
const sequelize = providers('sequelize').forDB('concava')

const DeviceLabel = sequelize.define('device_label', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	device_id: Sequelize.INTEGER,
	name: Sequelize.STRING,
	key: Sequelize.STRING,
	value: Sequelize.STRING,
})

module.exports = DeviceLabel
