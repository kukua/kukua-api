const _ = require('underscore')
const BaseModel = require('./Base')
const MeasurementFilterModel = require('./MeasurementFilter')

class MeasurementListModel extends BaseModel {
	constructor (attributes, providerFactory) {
		super(attributes, providerFactory)

		if (typeof attributes !== 'object') {
			throw new Error('Attributes object required for measurement list model.')
		}
		if ( ! (attributes.filter instanceof MeasurementFilterModel)) {
			throw new Error('Invalid measurement filter.')
		}
		if ( ! Array.isArray(attributes.items)) {
			throw new Error('Invalid measurement list items.')
		}
	}

	toJSON () {
		var items = this.get('items')

		return {
			filter: this.get('filter'),
			columns: (items.length > 0 ? _.keys(items[0]) : []),
			values: _.map(items, (item) => _.values(item)),
		}
	}
}

module.exports = MeasurementListModel
