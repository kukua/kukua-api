// Values in err.data object will be added to response and log
class ValidationError extends Error {
	constructor (msg = 'Bad request.', details = []) {
		super(msg)
		this.statusCode = 400
		this.data = { details }
	}
}
class BadRequestError extends Error {
	constructor (msg = 'Bad request.') {
		super(msg)
		this.statusCode = 400
	}
}
class UnauthorizedError extends Error {
	constructor (msg = 'Unauthorized.') {
		super(msg)
		this.statusCode = 401
	}
}
class NotFoundError extends Error {
	constructor (msg = 'Not found.') {
		super(msg)
		this.statusCode = 404
	}
}
class InternalServerError extends Error {
	constructor (msg = 'Woah! Something went wrong. We have been notified.') {
		super(msg)
		this.statusCode = 500
	}
}

module.exports = {
	ValidationError,
	BadRequestError,
	UnauthorizedError,
	NotFoundError,
	InternalServerError,
}
