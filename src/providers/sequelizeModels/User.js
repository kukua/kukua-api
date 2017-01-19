const Sequelize = require('sequelize')

module.exports = (sequelize) => {
	return sequelize.define('user', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
		},
		name: Sequelize.STRING,
		email: Sequelize.STRING,
		password: Sequelize.STRING,
		is_active: Sequelize.BOOLEAN,
		is_admin: Sequelize.BOOLEAN,
		last_login: Sequelize.DATE,
	})
}
