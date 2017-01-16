// Factory
var providers = {}

module.exports = (name) => providers[name]

providers.log = require('./Log')
providers.sequelize = require('./Sequelize')
providers.auth = require('./Auth')
providers.user = require('./User')
providers.userConfig = require('./UserConfig')
providers.device = require('./Device')
providers.deviceGroup = require('./DeviceGroup')
providers.template = require('./Template')
providers.measurement = require('./Measurement')
providers.measurementFilter = require('./MeasurementFilter')
providers.job = require('./Job')
providers.jobScheduler = require('./JobScheduler')
