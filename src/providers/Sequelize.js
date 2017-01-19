const Sequelize = require('sequelize')
const BaseProvider = require('./Base')

class SequelizeProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._instances = {} // Singletons
	}

	forDB (database, env = null, logger = null) {
		if ( ! this._instances[database]) {
			var logging = false

			if ( ! env) {
				env = process.env.NODE_ENV
			}
			if (env !== 'production') {
				if (typeof logger !== 'function') {
					var log = this._getProvider('log').child({ type: 'sequelize' })
					logger = (sql) => {
						log.debug({ database }, sql.replace(/Executing \(\w+\): /, ''))
					}
				}

				logging = logger
			}

			this._instances[database] = new Sequelize(
				database,
				process.env.MYSQL_USER,
				process.env.MYSQL_PASSWORD,
				{
					host: process.env.MYSQL_HOST,
					dialect: 'mysql',
					define: {
						timestamps: true, // Updating timestamps is done by PostgreSQL triggers
						underscored: true, // Use created_at and updated_at
					},
					logging,
				}
			)
		}

		return this._instances[database]
	}
}

module.exports = SequelizeProvider
