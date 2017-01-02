const Sequelize = require('sequelize')
const sequelize = require('../helpers/sequelize')('concava')

var UserToken = sequelize.define('user_token', {
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

module.exports = {
	SequelizeModel: UserToken,
}
