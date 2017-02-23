const _ = require('underscore')
const hash = require('murmurhash3js')[process.arch]
const BaseProvider = require('./Base')

class CacheProvider extends BaseProvider {
	constructor (providerFactory) {
		super(providerFactory)

		this._enabled = true
		this._headers = ['accept', 'accept-encoding', 'accept-language']
		this._expire = 24 * 60 * 60 * 1000 // ms
		this._cache = {}
		this._cleanUpTimer = setInterval(this.cleanUpCache.bind(this), 30 * 60 * 1000)
	}

	setEnabled (enabled) {
		this._enabled = !! enabled
		return this
	}
	isEnabled () {
		return this._enabled
	}

	clearCache () {
		this._cache = {}
		return this
	}
	cleanUpCache () {
		if ( ! this.isEnabled()) return

		for (var fingerprint in this._cache) {
			if (this.hasCacheExpired(this._cache[fingerprint])) {
				delete this._cache[fingerprint]
			}
		}

		return this
	}
	hasCacheExpired (cached) {
		// Expire on invalid cache, disabled caching, or exceeded expiry date
		if (typeof cached !== 'object' || ! cached.timestamp) return true
		return ( ! this.isEnabled() || cached.timestamp + this._expire < Date.now())
	}

	checkFingerprint (req) {
		if ( ! req.fingerprint) {
			req.fingerprint = this.getFingerprint(req)
		}
		return this
	}
	getFingerprint (req) {
		var { url, query, headers } = req
		var userID = req.session.user.id
		var data = { url, query, headers: _.pick(headers, this._headers), userID }
		return hash.hash128(JSON.stringify(data))
	}
	getCachedResponse (req) {
		this.checkFingerprint(req)

		var cached = this._cache[req.fingerprint]

		// Not available
		if ( ! cached) return

		// Expired
		if (this.hasCacheExpired(cached)) {
			delete this._cache[req.fingerprint]
			return
		}

		return cached.response
	}
	setCachedResponse (req, response) {
		this.checkFingerprint(req)
		this._cache[req.fingerprint] = {
			timestamp: Date.now(),
			response,
		}
		return this
	}

	get middleware () {
		return this._middleware.bind(this)
	}
	_middleware (req, res, next) {
		if ( ! this.isEnabled()) return next()
		if (res.finished) return next()
		if (req.method !== 'GET') return next()

		var response = this.getCachedResponse(req)

		if ( ! response) return next()

		this.setResponse(res, response)
	}
	respond (req, res, data) {
		var response = JSON.stringify(data)
		this.setResponse(res, response)

		if ( ! this.isEnabled()) return
		if (req.method !== 'GET') {
			// Clear cache on any change
			if (res.statusCode === 200) this.clearCache()
			return
		}

		this.setCachedResponse(req, response)
	}
	setResponse (res, response) {
		res.setHeader('Content-Type', 'application/json')
		res.send(response)
	}
}

module.exports = CacheProvider
