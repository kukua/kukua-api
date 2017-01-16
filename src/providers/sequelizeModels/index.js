const User = require('./User')
const UserToken = require('./UserToken')
const Device = require('./Device')
const DeviceLabel = require('./DeviceLabel')
const Template = require('./Template')
const Attribute = require('./Attribute')

// Relations
User.hasMany(UserToken)
UserToken.belongsTo(User)

Device.hasMany(DeviceLabel, { as: 'labels' })
DeviceLabel.belongsTo(Device)

Template.hasMany(Device)
Device.belongsTo(Template)

Template.hasMany(Attribute)
Attribute.belongsTo(Template)

module.exports = {
	User, UserToken,
	Device, DeviceLabel,
	Template, Attribute,
}
