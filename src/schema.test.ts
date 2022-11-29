import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { parseZodField } from './parseZodField'

describe('parseZodField', () => {
	it('String!', () => {
		expect(parseZodField(z.string())).toEqual({
			required: true,
			type: 'String',
		})
	})
})
