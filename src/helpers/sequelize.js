const Sequelize = require('sequelize')
const log = require('./log').child({ type: 'sequelize' })

var instances = {}

module.exports = (database) => {
	var logging = false

	if (process.env.NODE_ENV !== 'production') {
		logging = (sql) => log.debug({ database }, sql)
	}

	if ( ! instances[database]) {
		instances[database] = new Sequelize(database, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
			host: process.env.MYSQL_HOST,
			dialect: 'mysql',
			define: {
				timestamps: true, // Updating timestamps is done by PostgreSQL triggers
				underscored: true, // Use created_at and updated_at
			},
			logging,
		})
	}

	return instances[database]
}
