import { GraphQLType } from './parseZodField'

export function createTypeCollector() {
	const types: Array<{ type: GraphQLType; path: string[] }> = []

	return {
		types,
		collectType(type: GraphQLType, path: string[]) {
			types.push({ type, path })
		},
	}
}
