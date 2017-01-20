const moment = require('moment-timezone')
const formatDate = require('../../src/helpers/formatDate')

describe('Format date helper', () => {
	it('should be a function accepting one argument', () => {
		expect(typeof formatDate).toBe('function')
		expect(formatDate.length).toBe(1)
	})
	it('should expect a moment instance as first argument', () => {
		expect(() => formatDate(null)).toThrowError('Invalid moment instance.')
		expect(() => formatDate(new Date())).toThrowError('Invalid moment instance.')
		expect(typeof formatDate(moment())).toBe('string')
	})
	it('should return the formatted date string', () => {
		expect(typeof formatDate(moment())).toBe('string')
		expect(formatDate(moment.utc('2010-01-01'))).toBe('2010-01-01T00:00:00.000+00:00')
		expect(formatDate(moment('2010-01-01T13:37:00+01:00'))).toBe('2010-01-01T12:37:00.000+00:00')
	})
})
