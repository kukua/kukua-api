const Promise = require('bluebird')
const providers = require('./')
const TemplateModel = require('../models/Template')
const DeviceModel = require('../models/Device')
const { Template, Attribute } = require('./sequelizeModels/')

const methods = {
	_createModel (template) {
		var attr = template.get()

		attr.attributes = attr.attributes.map((attribute) => attribute.name)

		return new TemplateModel(attr, providers)
	},
	findByDevice: (device) => new Promise((resolve, reject) => {
		if ( ! (device instanceof DeviceModel)) return reject('Invalid Device given.')

		Template.findById(device.get('template_id'), {
			include: {
				model: Attribute,
				required: false,
			},
		})
			.then((template) => resolve(methods._createModel(template)))
			.catch(reject)
	}),
}

module.exports = methods
