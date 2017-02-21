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
			config: 'object',
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

	loadConfig () {
		return this._getProvider('userGroupConfig').findByGroup(this)
			.then((config) => {
				var key = 'config'
				this.set(key, config)
				return [key, config]
			})
	}
	loadUsers () {
		return this._getProvider('user').findByGroup(this)
			.then((users) => {
				var key = 'users'
				this.set(key, users)
				return [key, users]
			})
	}
}

module.exports = UserGroupModel
