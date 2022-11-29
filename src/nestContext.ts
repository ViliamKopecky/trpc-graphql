import { SchemaContext } from './parseZodField'

export function nestContext(name: string | number, context: SchemaContext) {
	return {
		...context,
		path: [...context.path, name],
	}
}
