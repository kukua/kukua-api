const Sequelize = require('sequelize')

module.exports = (sequelize) => {
	return sequelize.define('location', {
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
}
