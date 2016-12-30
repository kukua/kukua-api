const Sequelize = require('sequelize')
const sequelize = require('../helpers/sequelize')('concava')

var Attribute = sequelize.define('attribute', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	name: Sequelize.STRING,
})

module.exports = {
	SequelizeModel: Attribute,
}
