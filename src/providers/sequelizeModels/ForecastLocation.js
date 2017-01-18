const Sequelize = require('sequelize')
const providers = require('../')
const sequelize = providers('sequelize').forDB('forecasts')

const ForecastLocation = sequelize.define('location', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	city: Sequelize.STRING,
	country: Sequelize.STRING,
	timezone: Sequelize.STRING,
	latitude: Sequelize.FLOAT,
	longitude: Sequelize.FLOAT,
	altitude_meters: {
		type: Sequelize.INTEGER,
		field: 'altitude',
	},
})

module.exports = ForecastLocation
