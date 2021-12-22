import React, { FC } from 'react'
import Head from 'next/head'
import { ApolloProvider } from 'react-apollo'

  
import { getSession, Provider } from "next-auth/client"

import initApollo from '../graphql/client'
import { UserContext } from '../context'

import get from 'lodash/get'
import App from 'next/app'
import NextCookies from 'next-cookies'
import getConfig from 'next/config'
import * as Sentry from '@sentry/node'

import { Toast, ErrorBoundary, AppLayout } from '../components'
import { appWithTranslation } from '../i18n'
import { isAuthenticated } from '../auth/utils'
import { withHealthchecks } from '../utils/Healthchecks/withHealthchecks'
import router from 'next/router'


const {
  publicRuntimeConfig: { SENTRY_DSN },
} = getConfig()

Sentry.init({
  dsn: SENTRY_DSN,
})

const Layout: FC = ({ children }) => {
  return (
    <div>
      <Head>
        <title>Ísland.is</title>
      </Head>
      {children}
    </div>
  )
}

const getLanguage = (path) => {
  if(path === undefined) {
    return 'is'
  }
  if (path.startsWith('en')) {
    return 'en'
  }
  return 'is'
}

const SupportApplication: any = ({ Component, pageProps }) => {
  if(process.browser) {
    Sentry.configureScope((scope) => {
      scope.setExtra('lang', getLanguage(pageProps.router.pathname))
      scope.setContext('router', {
        route: pageProps.router.route,
        pathname: pageProps.router.pathname,
        query: pageProps.router.query,
        asPath: pageProps.router.asPath,
      })
    })
  }

  Sentry.addBreadcrumb({
    category: 'pages/_app',
    message: `Rendering app for Component "${get(
      Component,
      'name',
      'unknown',
    )}" (${process.browser ? 'browser' : 'server'})`,
    level: Sentry.Severity.Debug,
  })

  return (
    <ApolloProvider client={initApollo(pageProps.apolloState)}>
      <Provider session={pageProps.session} >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </ApolloProvider>
  )
}

SupportApplication.getInitialProps = async (appContext) => {
  const { Component, ctx } = appContext
  const apolloClient = initApollo({})
  const customContext = {
    ...ctx,
    apolloClient,
  }
  let pageProps, layoutProps
  const session = await getSession()
  if(Component.getInitialProps) {
    pageProps = (await Component.getInitialProps(customContext)) as any
  }
  if(AppLayout.getInitialProps) {
    layoutProps = await AppLayout.getInitialProps({
      ...customContext,
      locale: pageProps.locale,
      localeKey: pageProps.localeKey,
      routeKey: pageProps.route,
    }) as any
  }

  const readonlyCookies = NextCookies(appContext)
    Sentry.configureScope((scope) => {
      scope.setContext('cookies', readonlyCookies)
    })

  const apolloState = apolloClient.cache.extract()

  return {
    pageProps: {
      layoutProps: { ...layoutProps, ...pageProps.layoutConfig},
      pageProps: pageProps,
      apolloState: apolloState,
      session: session,
      router: router,
    }
  }
}

const { serverRuntimeConfig } = getConfig()
const { graphqlEndpoint, apiUrl } = serverRuntimeConfig
const externalEndpointDependencies = [graphqlEndpoint, apiUrl]

export default appWithTranslation(
  withHealthchecks(externalEndpointDependencies)(SupportApplication),
)