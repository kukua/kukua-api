const Sequelize = require('sequelize')
const providers = require('./')

const methods = {
	_instances: {}, // Singletons
	forDB (database, env, logger) {
		var instances = methods._instances

		if ( ! instances[database]) {
			var logging = false

			if ( ! env) {
				env = process.env.NODE_ENV
			}
			if (env !== 'production') {
				if (typeof logger !== 'function') {
					var log = providers('log').child({ type: 'sequelize' })
					logger = (sql) => {
						log.debug({ database }, sql.replace(/Executing \(\w+\): /, ''))
					}
				}

				logging = logger
			}

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
	},
}

module.exports = methods
