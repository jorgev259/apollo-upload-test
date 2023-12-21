import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { ApolloServer } from '@apollo/server'
import { gql } from '@apollo/client'

import processRequest from './graphql-upload/processRequest.mjs'
import GraphQLUpload from './graphql-upload/GraphQLUpload.mjs'

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

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => {
    /* const contentType = req.headers.get('content-type')

    if (contentType && contentType.includes('multipart/form-data')) {
      const body = await processRequest(req, res, { environment: 'next' })
      console.log(body)
    } */

    return {}
  }
})

export async function POST (req, res) {
  const contentType = req.headers.get('content-type')
  if (contentType && contentType.includes('multipart/form-data')) {
    const fileRequest = req.clone()
    const body = await processRequest(fileRequest, res)

    console.log(body)
  }

  return handler(req, res)
}

export { handler as GET }
