const Promise = require('bluebird')
const providers = require('./')
const ForecastFilterModel = require('../models/ForecastFilter')
const ForecastListModel = require('../models/ForecastList')

const sequelize = providers('sequelize').forDB('forecasts')

const methods = {
	findByFilter: (filter) => new Promise((resolve, reject) => {
		if ( ! (filter instanceof ForecastFilterModel)) return reject('Invalid forecast filter.')

		var selects = [
			'UNIX_TIMESTAMP(`date`) AS timestamp',
		]
		filter.getFields().forEach((name) => {
			if (name === 'timestamp') return
			selects.push(name)
		})

		var table = filter.getType()

		var where = `
			WHERE id = ${filter.getLocationID()}
				AND created_at = (
					SELECT created_at FROM \`${table}\`
					WHERE id = main.id AND date = main.date
					ORDER BY created_at DESC
					LIMIT 1
				)
		`.replace(/\t/g, '')

		var from = filter.getFrom()
		var to = filter.getTo()
		if (from) where += ` AND \`date\` >= '${from.toISOString()}'`
		if (to) where += ` AND \`date\` <= '${to.toISOString()}'`

		var order = ''
		var sorting = filter.getSorting().map(({ name, order }) => (
			`\`${name === 'timestamp' ? 'date' : name}\` ${order > 0 ? 'ASC' : 'DESC'}`
		))
		if (sorting.length) order = 'ORDER BY ' + sorting.join(', ')

		var limit = (filter.getLimit() ? `LIMIT ${filter.getLimit()}` : '')

		var sql = `
			SELECT ${selects.join(',')}
			FROM \`${table}\` as main
			${where}
			${order}
			${limit}
		`.replace(/\t/g, '')

		sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
			.then((items) => new ForecastListModel({ filter, items }, providers))
			.then(resolve)
			.catch(reject)
	}),
}

module.exports = methods
