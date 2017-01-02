const Sequelize = require('sequelize')

var instances = {}

module.exports = (database) => {
	if ( ! instances[database]) {
		instances[database] = new Sequelize(database, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
			host: process.env.MYSQL_HOST,
			dialect: 'mysql',
			define: {
				timestamps: true, // Updating timestamps is done by PostgreSQL triggers
				underscored: true, // Use created_at and updated_at
			},
			logging: (process.env.NODE_ENV === 'production' ? false : console.log),
		})
	}

	return instances[database]
}
