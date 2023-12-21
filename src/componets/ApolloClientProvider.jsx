'use client'
import { ApolloLink } from '@apollo/client'
import {
  NextSSRApolloClient,
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  SSRMultipartLink
} from '@apollo/experimental-nextjs-app-support/ssr'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

const httpLink = createUploadLink({ uri: '/api', headers: { 'Apollo-Require-Preflight': true } })

function makeClient () {
  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link: typeof window === 'undefined'
      ? ApolloLink.from([new SSRMultipartLink({ stripDefer: true }), httpLink])
      : httpLink
  })
}

export function ApolloWrapper ({ children }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
