const BaseProvider = require('./Base')

class SequelizeModelProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		var concava = this._getProvider('sequelize').forDB('concava')
		var User = require('./sequelizeModels/User')(concava)
		var UserToken = require('./sequelizeModels/UserToken')(concava)
		var Device = require('./sequelizeModels/Device')(concava)
		var DeviceLabel = require('./sequelizeModels/DeviceLabel')(concava)
		var Template = require('./sequelizeModels/Template')(concava)
		var Attribute = require('./sequelizeModels/Attribute')(concava)

		var forecasts = this._getProvider('sequelize').forDB('forecasts')
		var ForecastLocation = require('./sequelizeModels/ForecastLocation')(forecasts)

		// Relations
		User.hasMany(UserToken)
		UserToken.belongsTo(User)

		Device.hasMany(DeviceLabel, { as: 'labels' })
		DeviceLabel.belongsTo(Device)

		Template.hasMany(Device)
		Device.belongsTo(Template)

		Template.hasMany(Attribute)
		Attribute.belongsTo(Template)

		this._models = {
			User, UserToken,
			Device, DeviceLabel,
			Template, Attribute,
			ForecastLocation,
		}
	}

	getModel (name) {
		return this._models[name]
	}
}

module.exports = SequelizeModelProvider
