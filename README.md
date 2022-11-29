# tRPC + Zod = GraphQL

**Experimental** helpers to enable using tRPC as source for simple GraphQL server.

## Idea

To have tRPC router defined like this…

```ts
const FooDef = z
  .object({
    id: z.string(),
    name: z.string(),
    note: z.string().optional(),
  })
  .describe('FooType') // used as final type name

t.router({
  listFoo: t
    .input(
      z.object({
        count: z.number().int(),
      })
    )
    .output(z.array(FooDef))
    .query(async () => {
      // implementation
    }),

  createFoo: t
    .input(
      z.object({
        data: z.object({
          name: z.string(),
          note: z.string().optional(),
        }),
      })
    )
    .output(
      z.object({
        ok: z.boolean(),
        errorMessage: z.string().optional(),
        node: FooDef.optional(),
      })
    )
    .mutation(async () => {
      // implementation
    }),
})

```

…and automagically have a GraphQL schema like this:

```graphql
type FooType {
  id: String!
  name: String!
  note: String
}

type CreateFooOutput {
  ok: Boolean!
  errorMessage: String
  node: FooType
}

input CreateFooDataInput {
  name: String!
  note: String
}

type Query {
  listFoo(count: Int!): [FooType!]!
}

type Mutation {
  createFoo(data: CreateFooDataInput!): CreateFooOutput!
}
```

## Limits

- Require all procedures to define `input` and `output` with Zod so GraphQL schema can be generated.
- Field arguments allowed only on the root types (`Query` and `Mutation`)

## TODO

- [ ] Zod => GraphQL
  - [x] parsing basic Zod schemas
    - [x] `string`
    - [x] `number`
    - [x] `object`
    - [x] `array`
    - [ ] `enum`
    - [ ] `literal`
  - [x] translating to GraphQL code
  - [x] branding type names using `.describe()`
  - [ ] translating to actual `graphql.GraphQLSchema`
  - [ ] collect all nested types
  - [ ] differentiante `type` and `input` schemas
  - [ ] root `Query` and `Mutation`
  - [ ] arguments of fields
  - [ ] support custom scalars
  - [ ] Zod `extend` as GraphQL `interface`
- [ ] tRPC + Zod => GraphQL
  - [ ] distinguish queries and mutations
- [ ] find better solution to define custom type name other than `.describe()`
- [ ] warn on colliding types
