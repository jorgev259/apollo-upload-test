import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { ApolloServer, HeaderMap } from '@apollo/server'
import { gql } from '@apollo/client'
import { GraphQLUpload, processRequest } from 'graphql-upload-minimal'

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    hello: () => 'world'
  },
  Mutation: {
    hello: (_, variables, context) => {
      return 200
    }
  }
}

const typeDefs = gql`
  scalar Upload
    type Query {
      hello: String
    }
    type Mutation {
      hello (file:Upload!): Int!
    }
  `

const server = new ApolloServer({
  resolvers,
  typeDefs
})

async function contextFn () {
  return {}
}

const handler = startServerAndCreateNextHandler(server, {
  context: contextFn
})

async function createGraphqlRequest (req, res) {
  const body = await processRequest(req, res, { environment: 'next' })
  const headers = new HeaderMap()

  for (const [key, value] of req.headers.entries()) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }
  }

  const url = new URL(req.url)
  const httpGraphQLRequest = {
    body,
    headers,
    method: req.method || 'POST',
    search: url.search ?? ''
  }

  return httpGraphQLRequest
}

export async function POST (req, res) {
  const contentType = req.headers.get('content-type')
  if (contentType && contentType.includes('multipart/form-data')) {
    const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: await createGraphqlRequest(req, res),
      context: () => contextFn({ req, res })
    })

    const body = []
    if (httpGraphQLResponse.body.kind === 'complete') {
      body.push(httpGraphQLResponse.body.string)
    } else {
      for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
        body.push(chunk)
      }
    }

    const headers = {}
    for (const [key, value] of httpGraphQLResponse.headers) {
      headers[key] = value
    }

    const response = new Response(
      body.join(''),
      { headers, status: httpGraphQLResponse.status || 200 }
    )

    return response
  } else {
    return handler(req, res)
  }
}

export { handler as GET }
