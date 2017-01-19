const Sequelize = require('sequelize')

module.exports = (sequelize) => {
	return sequelize.define('device_label', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
		},
		device_id: Sequelize.INTEGER,
		name: Sequelize.STRING,
		key: Sequelize.STRING,
		value: Sequelize.STRING,
	})
}
