const Sequelize = require('sequelize')
const sequelize = require('../helpers/sequelize')

var Attribute = sequelize('concava').define('attribute', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	name: Sequelize.STRING,
})

module.exports = {
	SequelizeModel: Attribute,
}
