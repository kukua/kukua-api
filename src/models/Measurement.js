const mapProviderMethods = require('../helpers/mapProviderMethods')

var MeasurementModel = {}

MeasurementModel.setProvider = (MeasurementProvider) => {
	mapProviderMethods(MeasurementModel, MeasurementProvider)
}

module.exports = MeasurementModel
