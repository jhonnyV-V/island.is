import withApollo from '@island.is/web/graphql/withApollo'
import { withLocale } from '@island.is/web/i18n'
import ProjectNewsList from '@island.is/web/screens/Project/ProjectNewsList'
import { getServerSidePropsWrapper } from '@island.is/web/utils/getServerSidePropsWrapper'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore make web strict
const Screen = withApollo(withLocale('is')(ProjectNewsList))

export default Screen

export const getServerSideProps = getServerSidePropsWrapper(Screen)
