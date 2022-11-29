import { describe, expect, it } from 'vitest'
import { nestContext } from './nestContext'

describe('nestContext', () => {
	it('work with string name', () => {
		expect(nestContext('foo', { path: [] })).toEqual({ path: ['foo'] })
	})
	it('work with number name', () => {
		expect(nestContext(42, { path: [] })).toEqual({ path: [42] })
	})
	it('work nest', () => {
		expect(
			nestContext('foo', nestContext(42, nestContext('bar', { path: [] })))
		).toEqual({
			path: ['bar', 42, 'foo'],
		})
	})
})
