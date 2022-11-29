import { GraphQLType } from './parseZodField'
import { stringifyGraphQLField, StringifyOptions } from './stringifyGraphQLField'

export function stringifyGraphQLType(
	type: 'type' | 'input',
	def: GraphQLType,
	path?: string[],
	options?: StringifyOptions
): string {
	return `${type} ${def.name} { ${Object.entries(def.fields)
		.map(([key, value]) => {
			return `${key}: ${stringifyGraphQLField(value, path, options)}`
		})
		.join(', ')} }`
}
