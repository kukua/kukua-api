const BaseProvider = require('./Base')

class SequelizeModelProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		var sequelize = this._getProvider('sequelize').forDB('concava')

		var User = require('./sequelizeModels/User')(sequelize)
		var UserToken = require('./sequelizeModels/UserToken')(sequelize)
		var Device = require('./sequelizeModels/Device')(sequelize)
		var DeviceLabel = require('./sequelizeModels/DeviceLabel')(sequelize)
		var Template = require('./sequelizeModels/Template')(sequelize)
		var Attribute = require('./sequelizeModels/Attribute')(sequelize)
		var ForecastLocation = require('./sequelizeModels/ForecastLocation')(sequelize)

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
