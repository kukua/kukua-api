const Base = require('./Base')
const DeviceGroup = require('./DeviceGroup')
const Device = require('./Device')
const MeasurementFilter = require('./MeasurementFilter')
const Measurement = require('./Measurement')
const Template = require('./Template')

const DeviceGroupProvider = require('../providers/DeviceGroup')
const DeviceProvider = require('../providers/Device')
const MeasurementFilterProvider = require('../providers/MeasurementFilter')
const MeasurementProvider = require('../providers/Measurement')
const TemplateProvider = require('../providers/Template')

DeviceGroup.setProvider(DeviceGroupProvider)
Device.setProvider(DeviceProvider)
MeasurementFilter.setProvider(MeasurementFilterProvider)
Measurement.setProvider(MeasurementProvider)
Template.setProvider(TemplateProvider)

DeviceGroup.setRelations(Device)
Device.setRelations(DeviceGroup, Template)
Template.setRelations(Device)

module.exports = {
	Base,
	DeviceGroup,
	Device,
	MeasurementFilter,
	Measurement,
	Template,
}
