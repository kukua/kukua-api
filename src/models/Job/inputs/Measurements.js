const BaseInput = require('./Base')
const MeasurementFilterModel = require('../../MeasurementFilter')
const DeviceModel = require('../../Device')

class MeasurementsInput extends BaseInput {
	getFilter () {
		return MeasurementFilterModel.unserialize(this.getConfig(), this._getProviderFactory())
	}
	getModels () {
		var providerFactory = this._getProviderFactory()

		return this.getFilter()
			.then((filter) => filter.getAllDeviceIDs())
			.then((udids) => udids.map((id) => new DeviceModel({ id }, providerFactory)))
	}
	getData () {
		return this.getFilter()
			.then((filter) => this._getProvider('measurement').findByFilter(filter))
			.then((list) => list.getItems())
	}
}

MeasurementsInput.key = 'measurement_filter'

module.exports = MeasurementsInput
