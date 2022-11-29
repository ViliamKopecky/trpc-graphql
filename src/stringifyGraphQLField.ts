import { ZodGraphQLStringifyError } from './errors'
import { GraphQLField, GraphQLType } from './parseZodField'

export type GraphQLTypeOrInput = 'type' | 'input'

export type CollectTypeCallback = (
	type: GraphQLType,
	path: string[],
	context?: GraphQLTypeOrInput
) => void

export type StringifyOptions = {
	context?: GraphQLTypeOrInput
	collectType?: CollectTypeCallback
}

export function stringifyGraphQLField(
	field: GraphQLField,
	path?: string[],
	options?: StringifyOptions
): string {
	const localPath = path ?? []
	if (typeof field.type === 'string') {
		return `${field.type}${field.required ? '!' : ''}`
	}

	if (typeof field.type === 'object') {
		const type = field.type

		if ('item' in type) {
			return `[${stringifyGraphQLField(type.item, localPath, options)}]${
				field.required ? '!' : ''
			}`
		}

		if ('name' in type && 'fields' in type) {
			options?.collectType?.(type, localPath, options.context)
			Object.entries(type.fields).forEach(([key, value]) => {
				stringifyGraphQLField(value, [...localPath, key], options)
			})
			return `${type.name}${field.required ? '!' : ''}`
		}
	}

	throw new ZodGraphQLStringifyError(
		`Cannot stringify field ${JSON.stringify(field)}`
	)
}
