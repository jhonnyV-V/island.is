import { ComponentType } from 'react'
import { IntlProvider } from 'react-intl'

import {
  CustomPage,
  CustomPageUniqueIdentifier,
  Query,
  QueryGetCustomPageArgs,
} from '@island.is/web/graphql/schema'
import { useI18n } from '@island.is/web/i18n'
import { GET_CUSTOM_PAGE_QUERY } from '@island.is/web/screens/queries/CustomPage'
import { Screen, ScreenContext } from '@island.is/web/types'

interface CustomScreenContext extends ScreenContext {
  customPageData: CustomPageWrapperProps['customPageData']
}

export type CustomScreen<Props> = ComponentType<
  Props & { customPageData: CustomPageWrapperProps['customPageData'] }
> & {
  getProps?: (ctx: CustomScreenContext) => Promise<Props>
}

interface CustomPageWrapperProps {
  customPageData?: CustomPage | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps: any
}

export const withCustomPageWrapper = <Props,>(
  uniqueIdentifier: CustomPageUniqueIdentifier,
  Component: CustomScreen<
    Props & {
      customPageData?: CustomPageWrapperProps['customPageData']
    }
  >,
) => {
  const CustomPageWrapper: Screen<CustomPageWrapperProps> = ({
    customPageData,
    pageProps,
  }) => {
    const { activeLocale } = useI18n()
    return (
      <IntlProvider
        locale={activeLocale}
        messages={customPageData?.translationStrings}
      >
        <Component {...pageProps} customPageData={customPageData} />
      </IntlProvider>
    )
  }

  CustomPageWrapper.getProps = async (context) => {
    const [
      {
        data: { getCustomPage: customPageData },
      },
    ] = await Promise.all([
      context.apolloClient.query<Query, QueryGetCustomPageArgs>({
        query: GET_CUSTOM_PAGE_QUERY,
        variables: {
          input: {
            lang: context.locale,
            uniqueIdentifier,
          },
        },
      }),
    ])

    const [pageProps] = await Promise.all([
      Component?.getProps?.({ ...context, customPageData }),
    ])

    return {
      customPageData,
      pageProps,
      customAlertBanner: customPageData?.alertBanner,
      ...pageProps,
    }
  }

  return CustomPageWrapper
}
