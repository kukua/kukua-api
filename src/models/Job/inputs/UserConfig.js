const _ = require('underscore')
const BaseInput = require('./Base')

class UserConfigInput extends BaseInput {
	setConfig (config) {
		if (typeof config !== 'object' || ! config.where) {
			throw new Error('Invalid input for user config: Missing where object.')
		}
		if ( ! config.where.user_id) {
			throw new Error('Invalid input for user config: Missing where.user_id.')
		}

		this._config = config
		return this
	}

	getModels () {
		var { where } = this.getConfig()

		return this._getProvider('user').findByID(where.user_id)
			.then((user) => [user])
	}
	getData () {
		var { where: { id } } = this.getConfig()

		return this.getModels()
			.then(([ user ]) => this._getProvider('userConfig').findByUser(user, { id }))
			.then((config) => _.object(
				_.keys(config),
				_.map(config, (item) => item.getValue())
			))
	}
}

UserConfigInput.key = 'user_config'

module.exports = UserConfigInput
