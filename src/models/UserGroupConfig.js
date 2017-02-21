const BaseModel = require('./Base')

class UserGroupConfigModel extends BaseModel {
	getValue () {
		return this.get('value')
	}

	loadUserGroup () {
		return this._getProvider('userGroup').findByID(this.get('user_group_id'))
			.then((group) => {
				var key = 'user_group'
				this.set(key, group)
				return [key, group]
			})
	}
}

module.exports = UserGroupConfigModel
