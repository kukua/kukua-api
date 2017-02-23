const _ = require('underscore')
const BaseInput = require('./Base')

class UserGroupConfigInput extends BaseInput {
	setConfig (config) {
		if (typeof config !== 'object' || ! config.where) {
			throw new Error('Invalid input for user group config: Missing where object.')
		}
		if ( ! config.where.user_group_id) {
			throw new Error('Invalid input for user group config: Missing where.user_group_id.')
		}

		this._config = config
		return this
	}

	getUserGroup () {
		var { where } = this.getConfig()

		return this._getProvider('userGroup').findByID(where.user_group_id)
	}
	getModels () {
		return this.getUserGroup().then((group) => [group])
	}
	getData () {
		var { where: { id } } = this.getConfig()

		return this.getUserGroup()
			.then((group) => this._getProvider('userGroupConfig').findByGroup(group, { id }))
			.then((config) => _.object(
				_.keys(config),
				_.map(config, (item) => item.getValue())
			))
	}
}

UserGroupConfigInput.key = 'user_group_config'

module.exports = UserGroupConfigInput
