const Sequelize = require('sequelize')

module.exports = (sequelize) => {
	return sequelize.define('template', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
		},
		name: Sequelize.STRING,
	})
}
