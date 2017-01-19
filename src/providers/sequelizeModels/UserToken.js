const Sequelize = require('sequelize')

module.exports = (sequelize) => {
	return sequelize.define('user_token', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
		},
		user_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
		},
		token: {
			type: Sequelize.STRING,
			primaryKey: true,
		},
	})
}
