const Sequelize = require('sequelize')

module.exports = (sequelize) => {
	return sequelize.define('device', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
		},
		udid: {
			type: Sequelize.STRING(16),
			allowNull: false,
			set: function (val, key) {
				this.setDataValue(key, val.toLowerCase())
			},
			validate: {
				is: {
					args: /^[a-f0-9]{16}$/,
					msg: 'Device ID should be 16 hexadecimal characters',
				},
				notEmpty: true,
			},
		},
		template_id: Sequelize.INTEGER,
		name: Sequelize.STRING,
	})
}
