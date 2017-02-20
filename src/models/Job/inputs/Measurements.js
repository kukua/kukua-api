const BaseInput = require('./Base')
const MeasurementFilterModel = require('../../MeasurementFilter')

class MeasurementsInput extends BaseInput {
	getFilter () {
		return MeasurementFilterModel.unserialize(this.getConfig(), this._getProviderFactory())
	}
	getModels () {
		return this.getFilter()
			.then((filter) => this._getProvider('device').find({ id: filter.getAllDeviceIDs() }))
	}
	getData () {
		return this.getFilter()
			.then((filter) => this._getProvider('measurement').findByFilter(filter))
			.then((list) => list.getItems())
	}
}

MeasurementsInput.key = 'measurement_filter'

module.exports = MeasurementsInput
