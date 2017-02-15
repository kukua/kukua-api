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
	}

	getFilter () {
		return this.get('filter')
	}

	setItems (items = []) {
		var isGrouped = this.getFilter().isGrouped()

		if (isGrouped && ! Array.isArray(items)) {
			throw new Error('Invalid measurement items array.')
		} else if ( ! isGrouped && typeof items !== 'object') {
			throw new Error('Invalid measurement items object.')
		}

		this.set('items', items)
		return this
	}
	getItems () {
		return this.get('items')
	}

	getColumns () {
		var isGrouped = this.getFilter().isGrouped()
		var items = this.getItems()

		if (_.size(items) === 0) return []
		if (isGrouped) return _.keys(items[0])

		return _.keys(_.first(_.first(_.values(items))))
	}
	getValues () {
		var isGrouped = this.getFilter().isGrouped()
		var items = this.getItems()

		if (_.size(items) === 0) return (isGrouped ? {} : [])
		if (isGrouped) return _.map(items, (item) => _.values(item))

		return _.object(
			_.keys(items),
			_.map(items, (list) => _.map(list, (item) => _.values(item)))
		)
	}

	toJSON () {
		return {
			filter: this.getFilter(),
			columns: this.getColumns(),
			values: this.getValues(),
		}
	}
}

module.exports = MeasurementListModel
