const Sequelize = require('sequelize')
const providers = require('../')
const sequelize = providers('sequelize').forDB('concava')

const UserToken = sequelize.define('user_token', {
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

module.exports = UserToken
