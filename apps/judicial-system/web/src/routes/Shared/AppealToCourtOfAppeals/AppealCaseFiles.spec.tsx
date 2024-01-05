import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { render, screen } from '@testing-library/react'

import { CaseState, UserRole } from '@island.is/judicial-system/types'
import {
  CaseAppealRulingDecision,
  CaseDecision,
  CaseType,
} from '@island.is/judicial-system-web/src/graphql/schema'
import { mockCase } from '@island.is/judicial-system-web/src/utils/mocks'
import {
  FormContextWrapper,
  IntlProviderWrapper,
  UserContextWrapper,
} from '@island.is/judicial-system-web/src/utils/testHelpers'

import AppealCaseFiles from './AppealCaseFiles'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '',
      query: {
        id: 'test_id',
      },
    }
  },
}))

describe('AppealCaseFiles', () => {
  it('should render checkbox for prosecutors to request the court of appeal ruling be not published', () => {
    render(
      <IntlProviderWrapper>
        <ApolloProvider
          client={new ApolloClient({ cache: new InMemoryCache() })}
        >
          <UserContextWrapper userRole={UserRole.PROSECUTOR}>
            <FormContextWrapper
              theCase={{
                ...mockCase(CaseType.CUSTODY),
                state: CaseState.ACCEPTED,
                decision: CaseDecision.ACCEPTING,
                appealRulingDecision: CaseAppealRulingDecision.CHANGED,
              }}
            >
              <AppealCaseFiles />
            </FormContextWrapper>
          </UserContextWrapper>
        </ApolloProvider>
      </IntlProviderWrapper>,
    )

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should not render a checkbox for defenders to request the court of appeal ruling be not published', () => {
    render(
      <IntlProviderWrapper>
        <ApolloProvider
          client={new ApolloClient({ cache: new InMemoryCache() })}
        >
          <UserContextWrapper userRole={UserRole.DEFENDER}>
            <FormContextWrapper
              theCase={{
                ...mockCase(CaseType.CUSTODY),
                state: CaseState.ACCEPTED,
                decision: CaseDecision.ACCEPTING,
                appealRulingDecision: CaseAppealRulingDecision.CHANGED,
              }}
            >
              <AppealCaseFiles />
            </FormContextWrapper>
          </UserContextWrapper>
        </ApolloProvider>
      </IntlProviderWrapper>,
    )

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})
