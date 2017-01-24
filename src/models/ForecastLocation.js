const BaseModel = require('./Base')

class ForecastLocationModel extends BaseModel {
	get key () { return 'forecastLocation' }
}

module.exports = ForecastLocationModel
