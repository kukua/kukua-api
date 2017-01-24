const Promise = require('bluebird')
const moment = require('moment-timezone')
const FilterModel = require('./Filter')
const ForecastLocationModel = require('./ForecastLocation')

const types = ['daily', 'hourly']
const fields = {
	daily: [
		'timestamp', 'symbol', 'tempLow', 'tempHigh', 'precip', 'precipChance',
		'windSpeed', 'windDir'
	],
	hourly: [
		'timestamp', 'symbol', 'temp', 'tempFeel', 'precip',
		'windSpeed', 'windDir', 'gustSpeed', 'humid', 'seaLevel', 'solarRad'
	],
}

class ForecastFilterModel extends FilterModel {
	get key () { return 'forecastFilter' }
	get id () { return this.getType() }

	setType (type) {
		if (types.indexOf(type) === -1) throw new Error('Invalid type.')

		this.set('type', type)
		this.getFields().forEach((name) => this.checkField(name))

		return this
	}
	getType () {
		return this.get('type') || types[0]
	}
	setLocation (location) {
		if ( ! (location instanceof ForecastLocationModel)) {
			if (typeof location !== 'number') {
				throw new Error('Invalid location ID given.')
			}

			location = new ForecastLocationModel({ id: location }, this._getProviderFactory())
		}

		this.set('location', location)
		return this
	}
	getLocation () {
		return this.get('location')
	}
	getLocationID () {
		var location = this.getLocation()
		return (location ? location.id : null)
	}
	addField (name) {
		this.checkField(name)
		var fields = this.getFields()
		fields.push(name)
		this.set('fields', fields)
		return this
	}
	checkField (name) {
		var type = this.getType()

		if (fields[type].indexOf(name) === -1) {
			throw new Error(`Invalid field "${name}" for type "${type}".`)
		}
	}

	toJSON () {
		var data = super.toJSON()

		data.type = this.getType()
		data.location_id = this.getLocationID()

		return data
	}
}

ForecastFilterModel.unserialize = (json, providerFactory) => {
	try {
		var data = (typeof json === 'object' ? json : JSON.parse(json))
		var filter = new ForecastFilterModel({}, providerFactory)

		filter.setType(data.type)
		filter.setLocation(data.location_id)
		data.fields.map((name) => filter.addField(name))
		if (data.from) filter.setFrom(moment.utc(data.from))
		if (data.to) filter.setTo(moment.utc(data.to))
		data.sort.map(({ name, order }) => filter.addSort(name, order))
		filter.setLimit(data.limit)

		return Promise.resolve(filter)
	} catch (err) {
		return Promise.reject(err)
	}
}

module.exports = ForecastFilterModel
