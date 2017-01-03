const Promise = require('bluebird')
const Sequelize = require('sequelize')
const sequelize = require('../helpers/sequelize')('concava')
const Device = require('./Device').SequelizeModel
const Attribute = require('./_Attribute').SequelizeModel
const TemplateModel = require('../models/Template')
const DeviceModel = require('../models/Device')

var Template = sequelize.define('template', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	name: Sequelize.STRING,
})

Template.hasMany(Device)
Device.belongsTo(Template)
Template.hasMany(Attribute)
Attribute.belongsTo(Template)

const createModel = (template) => {
	var attr = template.get()

	attr.attributes = attr.attributes.map((attribute) => attribute.name)

	return new TemplateModel(attr)
}

module.exports = {
	SequelizeModel: Template,

	findByDevice: (device) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')

		// TODO(mauvm): Cache
		Template.findById(device.get('template_id'), {
			include: {
				model: Attribute,
				required: false,
			},
		}).then((template) => {
			resolve(createModel(template))
		}, reject)
	}),
}
