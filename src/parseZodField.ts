/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	ZodArray,
	ZodBoolean,
	ZodNullable,
	ZodNumber,
	ZodObject,
	ZodOptional,
	ZodString,
	ZodType,
	ZodTypeDef,
} from 'zod'
import { ZodGraphQLParserError } from './errors'
import { nestContext } from './nestContext'
import { TypeDescription } from './TypeDescription'

export type SchemaPath = Array<string | number>

export type SchemaContext = {
	path: SchemaPath
}

export type GraphQLScalar = 'String' | 'Int' | 'Float' | 'Boolean'

export type GraphQLField = {
	required: boolean
	type: GraphQLScalar | GraphQLType | GraphQLArray
	description?: string
}

export type GraphQLType = { name: string; fields: Record<string, GraphQLField> }

export type GraphQLArray = { item: GraphQLField }

export function unwrapNullableZodType<
	Output = any,
	Def extends ZodTypeDef = ZodTypeDef,
	Input = Output
>(
	def: ZodType<Output, Def, Input>
): { nullable: boolean; def: typeof def; description?: string } {
	if (def instanceof ZodNullable || def instanceof ZodOptional) {
		const unwrapped = def.unwrap()
		return {
			nullable: true,
			def: unwrapped as any,
			description: def.description ?? unwrapped.description,
		}
	}
	return { nullable: false, def, description: def.description }
}

export function parseZodField<
	Output = any,
	Def extends ZodTypeDef = ZodTypeDef,
	Input = Output
>(def: ZodType<Output, Def, Input>, context?: SchemaContext): GraphQLField {
	const localContext = context ?? { path: [], typeRepository: {} }

	const { nullable, def: inner, description } = unwrapNullableZodType(def)

	if (inner instanceof ZodArray) {
		const field: GraphQLField = {
			description: getDescription(description ?? inner.description),
			required: !nullable,
			type: {
				item: parseZodField(inner.element, nestContext(0, localContext)),
			},
		}
		return field
	}

	if (inner instanceof ZodObject) {
		const fieldType: GraphQLType = {
			name:
				getTypeName(inner.description) ??
				['UnnamedType', ...localContext.path].join('_'),
			fields: Object.fromEntries(
				Object.entries(inner._def.shape())
					.map(([key, value]) => {
						if (value instanceof ZodType) {
							return [
								key,
								parseZodField(value, nestContext(key, localContext)),
							] as const
						}
						return null
					})
					.filter(<I>(item: I | null): item is I => item !== null)
			),
		}

		const field: GraphQLField = {
			description: getDescription(description ?? inner.description),
			required: !nullable,
			type: fieldType,
		}
		return field
	}

	if (inner instanceof ZodBoolean) {
		const field: GraphQLField = {
			description: getDescription(description ?? inner.description),
			required: !nullable,
			type: 'Boolean',
		}
		return field
	}

	if (inner instanceof ZodNumber) {
		const field: GraphQLField = {
			description: getDescription(description ?? inner.description),
			required: !nullable,
			type: inner.isInt ? 'Int' : 'Float',
		}
		return field
	}

	if (inner instanceof ZodString) {
		const field: GraphQLField = {
			description: getDescription(description ?? inner.description),
			required: !nullable,
			type: 'String',
		}
		return field
	}

	throw new ZodGraphQLParserError(
		`Unsupported Zod type: ${JSON.stringify(inner)}`
	)
}

export function getDescription(
	description: undefined | null | string | TypeDescription
) {
	if (description instanceof TypeDescription) {
		return description.description ?? undefined
	}
	return description ?? undefined
}

const ValidTypeName = /^[A-Z][a-z0-9_]*$/g
export function getTypeName(
	description: undefined | null | string | TypeDescription
) {
	if (description instanceof TypeDescription) {
		return description.name ?? undefined
	}
	if (typeof description === 'string') {
		// kind of weird to use description as type name
		if (ValidTypeName.test(description)) {
			return description
		}
	}
	return undefined
}
