import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { parseZodField } from './parseZodField'
import { TypeDescription } from './TypeDescription'

describe('parseZodField', () => {
	it('String!', () => {
		expect(parseZodField(z.string())).toEqual({
			required: true,
			type: 'String',
		})
	})
	it('Int with .nullable()', () => {
		expect(parseZodField(z.number().int().nullable())).toEqual({
			required: false,
			type: 'Int',
		})
	})
	it('Float with .optional()', () => {
		expect(parseZodField(z.number().optional())).toEqual({
			required: false,
			type: 'Float',
		})
	})
	it('String with description', () => {
		expect(parseZodField(z.string().describe('This is a note'))).toEqual({
			required: true,
			type: 'String',
			description: 'This is a note',
		})
	})
	it('Optional with description', () => {
		expect(
			parseZodField(z.string().optional().describe('This is a note'))
		).toEqual({
			required: false,
			type: 'String',
			description: 'This is a note',
		})
	})
	it('[String]', () => {
		expect(parseZodField(z.array(z.string()))).toEqual({
			required: true,
			type: {
				item: { required: true, type: 'String' },
			},
		})
	})
	it('[String]!', () => {
		expect(parseZodField(z.array(z.string()).nullable())).toEqual({
			required: false,
			type: {
				item: { required: true, type: 'String' },
			},
		})
	})
	it('[String!]!', () => {
		expect(parseZodField(z.array(z.string().nullable()).nullable())).toEqual({
			required: false,
			type: {
				item: { required: false, type: 'String' },
			},
		})
	})
	it('[String!]', () => {
		expect(parseZodField(z.array(z.string()).nullable())).toEqual({
			required: false,
			type: {
				item: { required: true, type: 'String' },
			},
		})
	})
	it('UnnamedType { foo: String!, bar: Float }', () => {
		expect(
			parseZodField(z.object({ foo: z.string(), bar: z.number().optional() }))
		).toEqual({
			required: true,
			type: {
				name: 'UnnamedType',
				fields: {
					foo: { required: true, type: 'String' },
					bar: { required: false, type: 'Float' },
				},
			},
		})
	})
	it('NamedType { foo: String! }', () => {
		expect(
			parseZodField(
				z
					.object({ foo: z.string() })
					.describe(new TypeDescription('NamedType') as string)
			)
		).toEqual({
			required: true,
			type: {
				name: 'NamedType',
				fields: {
					foo: { required: true, type: 'String' },
				},
			},
		})
	})
})
