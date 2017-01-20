const moment = require('moment-timezone')

// ISO 8601
module.exports = (momentInstance) => {
	if ( ! moment.isMoment(momentInstance)) {
		throw new Error('Invalid moment instance.')
	}

	return momentInstance.utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
}
