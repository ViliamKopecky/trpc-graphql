import { describe, expect, it, vi } from 'vitest'
import { createTypeCollector } from './createTypeCollector'
import { stringifyGraphQLType } from './stringifyGraphQLType'

describe('stringifyGraphQLType', () => {
	it('simple type', () => {
		expect(
			stringifyGraphQLType('type', {
				name: 'FooType',
				fields: {
					foo: { required: true, type: 'String' },
				},
			})
		).toBe('type FooType { foo: String! }')
	})
	it('multiple fields type', () => {
		expect(
			stringifyGraphQLType('type', {
				name: 'BarType',
				fields: {
					foo: { required: true, type: 'String' },
					bar: { required: false, type: 'String' },
					baz: {
						required: false,
						type: { item: { required: true, type: 'String' } },
					},
				},
			})
		).toBe('type BarType { foo: String!, bar: String, baz: [String!] }')
	})
	it.skip('collectType is called', () => {
		const collectType = vi.fn()

		expect(
			stringifyGraphQLType(
				'type',
				{
					name: 'FooType',
					fields: {
						foo: { required: true, type: 'String' },
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
	it.skip('collectType works', () => {
		const { types, collectType } = createTypeCollector()

		stringifyGraphQLType(
			'type',
			{
				name: 'FooType',
				fields: {
					foo: { required: true, type: 'String' },
				},
			},
			[],
			{
				collectType,
			}
		)

		stringifyGraphQLType(
			'type',
			{
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
