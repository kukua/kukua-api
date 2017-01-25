const humanize = require('underscore.string/humanize')
const BaseModel = require('./Base')
const Validator = require('../helpers/validator')
const { ValidationError } = require('../helpers/errors')

class UserGroupModel extends BaseModel {
	get key () { return 'userGroup' }

	getUserIDs () {
		return this.get('users') || []
	}

	fill (data) {
		// Auto create name for user group
		if ( ! data.name && ! this.get('name')) {
			data.name = humanize(data.id || this.id)
		}

		if ( ! data.users && ! this.get('users')) {
			data.users = []
		}

		return super.fill(data)
	}

	getSchema () {
		return {
			id: 'required|string|regex:/^[a-zA-Z0-9]+$/',
			name: 'required|string',
			users: 'array',
			created_at: 'date',
			updated_at: 'date',
		}
	}
	validate (data) {
		var validator = new Validator(data || this.get(), this.getSchema())

		if (validator.fails()) {
			throw new ValidationError('Invalid user group.', validator.errors.all())
		}
	}

	loadUsers () {
		return this._getProvider('user').findByGroup(this)
			.then((users) => {
				this.set('users', users)
			})
	}
}

module.exports = UserGroupModel
