const Sequelize = require('sequelize')
const providers = require('../')
const sequelize = providers('sequelize').forDB('concava')

const Template = sequelize.define('template', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	name: Sequelize.STRING,
})

module.exports = Template
