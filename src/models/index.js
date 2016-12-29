const Base = require('./Base')
const DeviceGroup = require('./DeviceGroup')
const Device = require('./Device')
const MeasurementFilter = require('./MeasurementFilter')
const Measurement = require('./Measurement')

const DeviceGroupProvider = require('../providers/DeviceGroup')
const DeviceProvider = require('../providers/Device')
const MeasurementFilterProvider = require('../providers/MeasurementFilter')
const MeasurementProvider = require('../providers/Measurement')

DeviceGroup.setProvider(DeviceGroupProvider)
Device.setProvider(DeviceProvider)
MeasurementFilter.setProvider(MeasurementFilterProvider)
Measurement.setProvider(MeasurementProvider)

DeviceGroup.setRelations(Device)
Device.setRelations(DeviceGroup)

module.exports = {
	Base,
	DeviceGroup,
	Device,
	MeasurementFilter,
	Measurement,
}
