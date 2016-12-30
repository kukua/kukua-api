const Sequelize = require('sequelize')
const sequelize = require('../helpers/sequelize')('concava')

var DeviceLabel = sequelize.define('device_label', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	device_id: Sequelize.INTEGER,
	name: Sequelize.STRING,
	key: Sequelize.STRING,
	value: Sequelize.STRING,
})

module.exports = {
	SequelizeModel: DeviceLabel,
}
