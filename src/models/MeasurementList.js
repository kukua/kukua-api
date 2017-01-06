const _ = require('underscore')

var MeasurementFilter

class MeasurementListModel {
	constructor (filter, items = []) {
		if ( ! (filter instanceof MeasurementFilter)) {
			throw new Error('Invalid measurement filter.')
		}

		this._filter = filter
		this._items = items
	}

	getFilter () {
		return this._filter
	}
	getItems () {
		return this._items
	}

	toJSON () {
		var items = this.getItems()

		return {
			filter: this.getFilter(),
			columns: (items.length > 0 ? _.keys(items[0]) : []),
			values: _.map(items, (item) => _.values(item)),
		}
	}
}

/*MeasurementListModel.setProvider = (MeasurementListProvider) => {
	mapProviderMethods(MeasurementListModel, MeasurementListProvider)
}*/
MeasurementListModel.setRelations = (MeasurementFilterModel) => {
	MeasurementFilter = MeasurementFilterModel
}

module.exports = MeasurementListModel
