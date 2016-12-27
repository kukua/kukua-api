const respondWithError = require('./respondWithError')

module.exports = (req, res) => {
	if (req.accepts(['json', 'application/json'])) {
		return true
	}

	respondWithError(res, 400, 'Request does not accept JSON response.')
	return false
}
