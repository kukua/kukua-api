const Sequelize = require('sequelize')
const providers = require('../')
const sequelize = providers('sequelize').forDB('concava')

const User = sequelize.define('user', {
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

module.exports = User
