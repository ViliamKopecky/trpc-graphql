import { describe, expect, it, vi } from 'vitest'
import { createTypeCollector } from './createTypeCollector'
import { stringifyGraphQLField } from './stringifyGraphQLField'

describe('stringifyGraphQLField', () => {
	it('should add ! when required', () => {
		expect(stringifyGraphQLField({ required: true, type: 'Boolean' })).toBe('Boolean!')
		expect(stringifyGraphQLField({ required: true, type: 'String' })).toBe('String!')
		expect(stringifyGraphQLField({ required: true, type: 'Int' })).toBe('Int!')
		expect(stringifyGraphQLField({ required: true, type: 'Float' })).toBe('Float!')
	})
	it('should not add ! when not required', () => {
		expect(stringifyGraphQLField({ required: false, type: 'Boolean' })).toBe('Boolean')
		expect(stringifyGraphQLField({ required: false, type: 'String' })).toBe('String')
		expect(stringifyGraphQLField({ required: false, type: 'Int' })).toBe('Int')
		expect(stringifyGraphQLField({ required: false, type: 'Float' })).toBe('Float')
	})
	it('array', () => {
		expect(
			stringifyGraphQLField({
				required: true,
				type: {
					item: { required: true, type: 'Boolean' },
				},
			})
		).toBe('[Boolean!]!')
	})
	it('array of Booleans', () => {
		expect(
			stringifyGraphQLField({
				required: true,
				type: {
					item: { required: true, type: 'Boolean' },
				},
			})
		).toBe('[Boolean!]!')
	})
	it('object type', () => {
		expect(
			stringifyGraphQLField({
				required: true,
				type: {
					name: 'FooType',
					fields: {
						foo: { required: true, type: 'String' },
					},
				},
			})
		).toBe('FooType!')
	})
	it('collectType is called', () => {
		const collectType = vi.fn()

		expect(
			stringifyGraphQLField(
				{
					required: true,
					type: {
						name: 'FooType',
						fields: {
							foo: { required: true, type: 'String' },
						},
					},
				},
				[],
				{
					collectType,
				}
			)
		).toBe('FooType!')

		expect(collectType).toHaveBeenCalled()
	})
	it('collectType works', () => {
		const { types, collectType } = createTypeCollector()

		stringifyGraphQLField(
			{
				required: true,
				type: {
					name: 'FooType',
					fields: {
						foo: { required: true, type: 'String' },
					},
				},
			},
			[],
			{
				collectType,
			}
		)

		stringifyGraphQLField(
			{
				required: true,
				type: {
					name: 'BarType',
					fields: {
						bar: { required: true, type: 'String' },
						foo: {
							required: true,
							type: {
								name: 'FooType',
								fields: {
									foo: { required: true, type: 'String' },
								},
							},
						},
					},
				},
			},
			[],
			{
				collectType,
			}
		)

		expect(types).toMatchObject([
			{
				type: {
					name: 'FooType',
					fields: {
						foo: { required: true, type: 'String' },
					},
				},
				path: [],
			},
			{
				type: {
					name: 'BarType',
					fields: {
						bar: { required: true, type: 'String' },
					},
				},
				path: [],
			},
			{
				type: {
					name: 'FooType',
					fields: {
						foo: { required: true, type: 'String' },
					},
				},
				path: ['foo'],
			},
		])
	})
})
