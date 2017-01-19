const Promise = require('bluebird')
const BaseProvider = require('./Base')
const TemplateModel = require('../models/Template')
const DeviceModel = require('../models/Device')

class TemplateProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._DeviceModel = DeviceModel

		var sequelizeModel = this.getProvider('sequelizeModel')
		this._Template = sequelizeModel.getModel('Template')
		this._Attribute = sequelizeModel.getModel('Attribute')
	}

	_createModel (template) {
		var attr = template.get()

		attr.attributes = attr.attributes.map((attribute) => attribute.name)

		return new (TemplateModel)(attr, this._getProviderFactory())
	}

	findByDevice (device) {
		return new Promise((resolve, reject) => {
			if ( ! (device instanceof this._DeviceModel)) {
				return reject('Invalid Device given.')
			}

			this._Template.findById(device.get('template_id'), {
				include: {
					model: this._Attribute,
					required: false,
				},
			})
				.then((template) => resolve(this._createModel(template)))
				.catch(reject)
		})
	}
}

module.exports = TemplateProvider
