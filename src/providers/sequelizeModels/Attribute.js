const Sequelize = require('sequelize')
const providers = require('../')
const sequelize = providers('sequelize').forDB('concava')

const Attribute = sequelize.define('attribute', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	name: Sequelize.STRING,
})

module.exports = Attribute
