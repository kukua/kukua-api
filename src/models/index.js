const Base = require('./Base')
const User = require('./User')
const UserConfig = require('./UserConfig')
const DeviceGroup = require('./DeviceGroup')
const Device = require('./Device')
const Measurement = require('./Measurement')
const MeasurementFilter = require('./MeasurementFilter')
const MeasurementList = require('./MeasurementList')
const Template = require('./Template')
const Job = require('./Job')

const UserProvider = require('../providers/User')
const UserConfigProvider = require('../providers/UserConfig')
const DeviceGroupProvider = require('../providers/DeviceGroup')
const DeviceProvider = require('../providers/Device')
const MeasurementProvider = require('../providers/Measurement')
const MeasurementFilterProvider = require('../providers/MeasurementFilter')
const TemplateProvider = require('../providers/Template')
const JobProvider = require('../providers/Job')

User.setProvider(UserProvider)
UserConfig.setProvider(UserConfigProvider)
DeviceGroup.setProvider(DeviceGroupProvider)
Device.setProvider(DeviceProvider)
Measurement.setProvider(MeasurementProvider)
MeasurementFilter.setProvider(MeasurementFilterProvider)
Template.setProvider(TemplateProvider)
Job.setProvider(JobProvider)

User.setRelations(UserConfig)
UserConfig.setRelations(User)
DeviceGroup.setRelations(Device)
Device.setRelations(DeviceGroup, Template)
MeasurementFilter.setRelations(DeviceGroup)
MeasurementList.setRelations(MeasurementFilter)
Template.setRelations(Device)
Job.setRelations(MeasurementFilter, Measurement)

module.exports = {
	Base,
	User,
	UserConfig,
	DeviceGroup,
	Device,
	Measurement,
	MeasurementFilter,
	MeasurementList,
	Template,
}
