import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useLocalStorage } from 'react-use'
import format from 'date-fns/format'
import localeIS from 'date-fns/locale/is'
import parseISO from 'date-fns/parseISO'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'

import { Box, IconMapIcon, Text } from '@island.is/island-ui/core'
import { theme } from '@island.is/island-ui/theme'
import {
  capitalize,
  displayFirstPlusRemaining,
  formatDOB,
} from '@island.is/judicial-system/formatters'
import {
  isDistrictCourtUser,
  isProsecutionUser,
  isRequestCase,
} from '@island.is/judicial-system/types'
import { core, tables } from '@island.is/judicial-system-web/messages'
import {
  ContextMenu,
  Modal,
  TagAppealState,
  TagCaseState,
  UserContext,
} from '@island.is/judicial-system-web/src/components'
import { contextMenu as contextMenuStrings } from '@island.is/judicial-system-web/src/components/ContextMenu/ContextMenu.strings'
import IconButton from '@island.is/judicial-system-web/src/components/IconButton/IconButton'
import {
  ColumnCaseType,
  SortButton,
} from '@island.is/judicial-system-web/src/components/Table'
import { table as tableStrings } from '@island.is/judicial-system-web/src/components/Table/Table.strings'
import {
  CaseListEntry,
  CaseState,
} from '@island.is/judicial-system-web/src/graphql/schema'
import {
  directionType,
  sortableTableColumn,
  SortConfig,
} from '@island.is/judicial-system-web/src/types'
import {
  useCaseList,
  useViewport,
} from '@island.is/judicial-system-web/src/utils/hooks'
import { compareLocaleIS } from '@island.is/judicial-system-web/src/utils/sortHelper'

import MobileCase from './MobileCase'
import { strings } from './ActiveCases.strings'
import { cases as m } from './Cases.strings'
import * as styles from './Cases.css'

interface Props {
  cases: CaseListEntry[]
  isDeletingCase: boolean
  onDeleteCase?: (caseToDelete: CaseListEntry) => Promise<void>
}

const ActiveCases: React.FC<React.PropsWithChildren<Props>> = (props) => {
  const { cases, isDeletingCase, onDeleteCase } = props

  const { user } = useContext(UserContext)
  const { formatMessage } = useIntl()
  const { width } = useViewport()
  const [sortConfig, setSortConfig] = useLocalStorage<SortConfig>(
    'sortConfig',
    {
      column: 'courtDate',
      direction: 'descending',
    },
  )
  const [displayCases, setDisplayCases] = useState<CaseListEntry[]>([])
  const [modalVisible, setVisibleModal] = useState<'DELETE_CASE'>()
  // The index of requset that's about to be removed
  const [requestToRemoveIndex, setRequestToRemoveIndex] = useState<number>(-1)
  const { isOpeningCaseId, showLoading, handleOpenCase, LoadingIndicator } =
    useCaseList()

  useEffect(() => {
    setDisplayCases(cases)
  }, [cases])

  useMemo(() => {
    if (cases && sortConfig) {
      cases.sort((a: CaseListEntry, b: CaseListEntry) => {
        const getColumnValue = (entry: CaseListEntry) => {
          if (
            sortConfig.column === 'defendant' &&
            entry.defendants &&
            entry.defendants.length > 0
          ) {
            return entry.defendants[0].name ?? ''
          }
          if (sortConfig.column === 'courtDate') {
            return entry.postponedIndefinitelyExplanation
              ? ''
              : entry.courtDate ?? ''
          }
          return entry.created
        }
        const compareResult = compareLocaleIS(
          getColumnValue(a),
          getColumnValue(b),
        )

        return sortConfig.direction === 'ascending'
          ? compareResult
          : -compareResult
      })
    }
  }, [cases, sortConfig])

  const requestSort = (column: sortableTableColumn) => {
    let d: directionType = 'ascending'

    if (
      sortConfig &&
      sortConfig.column === column &&
      sortConfig.direction === 'ascending'
    ) {
      d = 'descending'
    }
    setSortConfig({ column, direction: d })
  }

  const getClassNamesFor = (name: sortableTableColumn) => {
    if (!sortConfig) {
      return
    }
    return sortConfig.column === name ? sortConfig.direction : undefined
  }

  return width < theme.breakpoints.md ? (
    <>
      {displayCases.map((theCase: CaseListEntry) => (
        <Box marginTop={2} key={theCase.id}>
          <MobileCase
            onClick={() => handleOpenCase(theCase.id)}
            theCase={theCase}
            isCourtRole={isDistrictCourtUser(user)}
            isLoading={isOpeningCaseId === theCase.id && showLoading}
          >
            {theCase.state &&
              theCase.state === CaseState.WAITING_FOR_CONFIRMATION && (
                <Text fontWeight={'medium'} variant="small">
                  {`${formatMessage(
                    m.activeRequests.table.headers.prosecutor,
                  )}: ${theCase.prosecutor?.name}`}
                </Text>
              )}
            {theCase.postponedIndefinitelyExplanation ? (
              <Text>{formatMessage(strings.postponed)}</Text>
            ) : (
              theCase.courtDate && (
                <Text fontWeight={'medium'} variant="small">
                  {`${formatMessage(tableStrings.hearing)} ${format(
                    parseISO(theCase.courtDate),
                    'd.M.y',
                  )} kl. ${format(parseISO(theCase.courtDate), 'kk:mm')}`}
                </Text>
              )
            )}
          </MobileCase>
        </Box>
      ))}
    </>
  ) : (
    <>
      <table className={styles.table} data-testid="activeCasesTable">
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>
              <Text as="span" fontWeight="regular">
                {formatMessage(tables.caseNumber)}
              </Text>
            </th>
            <th className={styles.th}>
              <SortButton
                title={capitalize(
                  formatMessage(core.defendant, { suffix: 'i' }),
                )}
                onClick={() => requestSort('defendant')}
                sortAsc={getClassNamesFor('defendant') === 'ascending'}
                sortDes={getClassNamesFor('defendant') === 'descending'}
                isActive={sortConfig?.column === 'defendant'}
                dataTestid="accusedNameSortButton"
              />
            </th>
            <th className={styles.th}>
              <Text as="span" fontWeight="regular">
                {formatMessage(m.activeRequests.table.headers.type)}
              </Text>
            </th>
            <th className={styles.th}>
              <SortButton
                title={capitalize(
                  formatMessage(tables.created, { suffix: 'i' }),
                )}
                onClick={() => requestSort('createdAt')}
                sortAsc={getClassNamesFor('createdAt') === 'ascending'}
                sortDes={getClassNamesFor('createdAt') === 'descending'}
                isActive={sortConfig?.column === 'createdAt'}
                dataTestid="createdAtSortButton"
              />
            </th>
            <th className={styles.th}>
              <Text as="span" fontWeight="regular">
                {formatMessage(tables.state)}
              </Text>
            </th>
            <th className={styles.th}>
              <SortButton
                title={capitalize(formatMessage(tableStrings.hearing))}
                onClick={() => requestSort('courtDate')}
                sortAsc={getClassNamesFor('courtDate') === 'ascending'}
                sortDes={getClassNamesFor('courtDate') === 'descending'}
                isActive={sortConfig?.column === 'courtDate'}
              />
            </th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <LayoutGroup>
          <tbody>
            <AnimatePresence>
              {cases.map((c, i) => (
                <motion.tr
                  key={c.id}
                  className={styles.tableRowContainer}
                  layout
                  data-testid="custody-cases-table-row"
                  role="button"
                  aria-label="Opna kröfu"
                  aria-disabled={isDeletingCase || isOpeningCaseId === c.id}
                  onClick={() => {
                    handleOpenCase(c.id)
                  }}
                >
                  <td className={styles.td}>
                    {c.appealCaseNumber ? (
                      <Box display="flex" flexDirection="column">
                        <Text as="span" variant="small">
                          {c.appealCaseNumber}
                        </Text>
                        <Text as="span" variant="small">
                          {c.courtCaseNumber}
                        </Text>
                        <Text as="span" variant="small">
                          {displayFirstPlusRemaining(c.policeCaseNumbers)}
                        </Text>
                      </Box>
                    ) : c.courtCaseNumber ? (
                      <>
                        <Box component="span" className={styles.blockColumn}>
                          <Text as="span">{c.courtCaseNumber}</Text>
                        </Box>
                        <Text
                          as="span"
                          variant="small"
                          color="dark400"
                          title={c.policeCaseNumbers?.join(', ')}
                        >
                          {displayFirstPlusRemaining(c.policeCaseNumbers)}
                        </Text>
                      </>
                    ) : (
                      <Text as="span" title={c.policeCaseNumbers?.join(', ')}>
                        {displayFirstPlusRemaining(c.policeCaseNumbers) || '-'}
                      </Text>
                    )}
                  </td>
                  <td className={styles.td}>
                    {c.defendants && c.defendants.length > 0 ? (
                      <>
                        <Text>
                          <Box component="span" className={styles.blockColumn}>
                            {c.defendants[0].name ?? '-'}
                          </Box>
                        </Text>
                        {c.defendants.length === 1 ? (
                          (!c.defendants[0].noNationalId ||
                            c.defendants[0].nationalId) && (
                            <Text>
                              <Text as="span" variant="small" color="dark400">
                                {formatDOB(
                                  c.defendants[0].nationalId,
                                  c.defendants[0].noNationalId,
                                )}
                              </Text>
                            </Text>
                          )
                        ) : (
                          <Text as="span" variant="small" color="dark400">
                            {`+ ${c.defendants.length - 1}`}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text>-</Text>
                    )}
                  </td>
                  <td className={styles.td}>
                    <ColumnCaseType
                      type={c.type}
                      decision={c?.decision}
                      parentCaseId={c.parentCaseId}
                    />
                  </td>
                  <td className={styles.td}>
                    <Text as="span">
                      {format(parseISO(c.created ?? ''), 'd.M.y', {
                        locale: localeIS,
                      })}
                    </Text>
                  </td>
                  <td className={styles.td} data-testid="tdTag">
                    <Box
                      marginRight={c.appealState ? 1 : 0}
                      marginBottom={c.appealState ? 1 : 0}
                    >
                      <TagCaseState
                        caseState={c.state}
                        caseType={c.type}
                        isCourtRole={isDistrictCourtUser(user)}
                        isValidToDateInThePast={c.isValidToDateInThePast}
                        courtDate={c.courtDate}
                        indictmentDecision={c.indictmentDecision}
                        indictmentRulingDecision={c.indictmentRulingDecision}
                      />
                    </Box>
                    {c.appealState && (
                      <TagAppealState
                        appealState={c.appealState}
                        appealRulingDecision={c.appealRulingDecision}
                      />
                    )}
                  </td>
                  <td className={styles.td}>
                    {c.postponedIndefinitelyExplanation ? (
                      <Text>{formatMessage(strings.postponed)}</Text>
                    ) : (
                      c.courtDate && (
                        <>
                          <Text>
                            <Box
                              component="span"
                              className={styles.blockColumn}
                            >
                              {capitalize(
                                format(
                                  parseISO(c.courtDate),
                                  'EEEE d. LLLL y',
                                  {
                                    locale: localeIS,
                                  },
                                ),
                              ).replace('dagur', 'd.')}
                            </Box>
                          </Text>
                          <Text as="span" variant="small">
                            kl. {format(parseISO(c.courtDate), 'kk:mm')}
                          </Text>
                        </>
                      )
                    )}
                  </td>
                  <td className={styles.td}>
                    <AnimatePresence exitBeforeEnter initial={false}>
                      {isOpeningCaseId === c.id && showLoading ? (
                        <div className={styles.deleteButtonWrapper}>
                          <LoadingIndicator />
                        </div>
                      ) : (
                        <ContextMenu
                          menuLabel={`Valmynd fyrir mál ${c.courtCaseNumber}`}
                          items={[
                            {
                              title: formatMessage(
                                contextMenuStrings.openInNewTab,
                              ),
                              onClick: () => handleOpenCase(c.id, true),
                              icon: 'open',
                            },
                            ...(isProsecutionUser(user) &&
                            (isRequestCase(c.type) ||
                              c.state === CaseState.DRAFT ||
                              c.state === CaseState.WAITING_FOR_CONFIRMATION)
                              ? [
                                  {
                                    title: formatMessage(
                                      contextMenuStrings.deleteCase,
                                    ),
                                    onClick: () => {
                                      setRequestToRemoveIndex(i)
                                      setVisibleModal('DELETE_CASE')
                                    },
                                    icon: 'trash' as IconMapIcon,
                                  },
                                ]
                              : []),
                          ]}
                          disclosure={
                            <IconButton
                              icon="ellipsisVertical"
                              colorScheme="transparent"
                              onClick={(evt) => {
                                evt.stopPropagation()
                              }}
                            />
                          }
                        />
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </LayoutGroup>
      </table>
      {modalVisible === 'DELETE_CASE' && (
        <Modal
          title={formatMessage(m.activeRequests.deleteCaseModal.title)}
          text={formatMessage(m.activeRequests.deleteCaseModal.text)}
          onPrimaryButtonClick={async () => {
            if (onDeleteCase && requestToRemoveIndex !== -1) {
              await onDeleteCase(cases[requestToRemoveIndex])
              setDisplayCases((prev) =>
                prev.filter((c) => c.id !== cases[requestToRemoveIndex].id),
              )
              setRequestToRemoveIndex(-1)
              setVisibleModal(undefined)
            }
          }}
          onSecondaryButtonClick={() => {
            setVisibleModal(undefined)
          }}
          primaryButtonText={formatMessage(
            m.activeRequests.deleteCaseModal.primaryButtonText,
          )}
          primaryButtonColorScheme="destructive"
          secondaryButtonText={formatMessage(
            m.activeRequests.deleteCaseModal.secondaryButtonText,
          )}
          isPrimaryButtonLoading={isDeletingCase}
        />
      )}
    </>
  )
}

export default ActiveCases
