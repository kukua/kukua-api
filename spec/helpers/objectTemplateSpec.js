const objectTemplate = require('../../src/helpers/objectTemplate')

describe('Object template helper', () => {
	it('should be a function accepting two arguments', () => {
		expect(typeof objectTemplate).toBe('function')
		expect(objectTemplate.length).toBe(2)
	})
	it('should expect a template and values object as arguments', () => {
		expect(objectTemplate('{{data.test}}', { test: 'aaa' })).toBe('aaa')
	})
	it('should allow using context and ctx as references to data', () => {
		expect(objectTemplate('{{context.test}}', { test: 'aaa' })).toBe('aaa')
		expect(objectTemplate('{{ctx.test}}', { test: 'aaa' })).toBe('aaa')
	})
	it('should allow replacing deep variables with deep values', () => {
		expect(objectTemplate(
			{ foo: '{{data.a.d}}', bar: ['{{ctx.a.b.c}}'] },
			{ a: { b: { c: 'aaa' }, d: 'hello' } }
		)).toEqual({ foo: 'hello', bar: ['aaa'] })
	})
	it('should allow replacing entire object with value', () => {
		expect(objectTemplate(
			{ $replace: 'data.a.d' },
			{ a: { b: { c: 'aaa' }, d: 'hello' } }
		)).toBe('hello')
		expect(objectTemplate(
			{ foo: { $replace: 'data.a.b.c' } },
			{ a: { b: { c: 'aaa' }, d: 'hello' } }
		)).toEqual({ foo: 'aaa' })
	})
})
