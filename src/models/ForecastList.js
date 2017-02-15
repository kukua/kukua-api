const _ = require('underscore')
const BaseModel = require('./Base')
const ForecastFilterModel = require('./ForecastFilter')

class ForecastListModel extends BaseModel {
	constructor (attributes, providerFactory) {
		super(attributes, providerFactory)

		if (typeof attributes !== 'object') {
			throw new Error('Attributes object required for forecast list model.')
		}
		if ( ! (attributes.filter instanceof ForecastFilterModel)) {
			throw new Error('Invalid forecast filter.')
		}
	}

	getFilter () {
		return this.get('filter')
	}

	setItems (items = []) {
		if ( ! Array.isArray(items)) {
			throw new Error('Invalid forecast items array.')
		}

		this.set('items', items)
		return this
	}
	getItems () {
		return this.get('items')
	}

	getColumns () {
		var items = this.getItems()
		return (items.length > 0 ? _.keys(items[0]) : [])
	}
	getValues () {
		return _.map(this.getItems(), (item) => _.values(item))
	}

	toJSON () {
		return {
			filter: this.getFilter(),
			columns: this.getColumns(),
			values: this.getValues(),
		}
	}
}

module.exports = ForecastListModel
