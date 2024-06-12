import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import { AnimatePresence } from 'framer-motion'

import { Box, Text } from '@island.is/island-ui/core'
import {
  isCompletedCase,
  isDistrictCourtUser,
  isPublicProsecutor,
  isPublicProsecutorUser,
  isTrafficViolationCase,
} from '@island.is/judicial-system/types'
import {
  FileNotFoundModal,
  PdfButton,
  SectionHeading,
  UserContext,
} from '@island.is/judicial-system-web/src/components'
import {
  CaseFile,
  CaseFileCategory,
} from '@island.is/judicial-system-web/src/graphql/schema'
import { TempCase as Case } from '@island.is/judicial-system-web/src/types'
import { useFileList } from '@island.is/judicial-system-web/src/utils/hooks'

import { caseFiles } from '../../routes/Prosecutor/Indictments/CaseFiles/CaseFiles.strings'
import { strings } from './IndictmentCaseFilesList.strings'

interface Props {
  workingCase: Case
}

interface RenderFilesProps {
  caseFiles: CaseFile[]
  onOpenFile: (fileId: string) => void
}

export const RenderFiles: React.FC<
  React.PropsWithChildren<Props & RenderFilesProps>
> = (props) => {
  const { caseFiles, onOpenFile, workingCase } = props

  return (
    <>
      {caseFiles.map((file) => (
        <Box key={file.id} marginBottom={2}>
          <PdfButton
            caseId={workingCase.id}
            title={file.name}
            renderAs="row"
            disabled={!file.key}
            handleClick={() => onOpenFile(file.id)}
          />
        </Box>
      ))}
    </>
  )
}

const IndictmentCaseFilesList: React.FC<React.PropsWithChildren<Props>> = (
  props,
) => {
  const { workingCase } = props
  const { formatMessage } = useIntl()
  const { user } = useContext(UserContext)
  const { onOpen, fileNotFound, dismissFileNotFound } = useFileList({
    caseId: workingCase.id,
  })

  const showTrafficViolationCaseFiles = isTrafficViolationCase(workingCase)

  const cf = workingCase.caseFiles

  const coverLetters = cf?.filter(
    (file) => file.category === CaseFileCategory.COVER_LETTER,
  )
  const indictments = cf?.filter(
    (file) => file.category === CaseFileCategory.INDICTMENT,
  )
  const criminalRecords = cf?.filter(
    (file) => file.category === CaseFileCategory.CRIMINAL_RECORD,
  )
  const costBreakdowns = cf?.filter(
    (file) => file.category === CaseFileCategory.COST_BREAKDOWN,
  )
  const others = cf?.filter(
    (file) =>
      file.category === CaseFileCategory.CASE_FILE && !file.policeCaseNumber,
  )
  const rulings = cf?.filter(
    (file) => file.category === CaseFileCategory.RULING,
  )
  const courtRecords = cf?.filter(
    (file) => file.category === CaseFileCategory.COURT_RECORD,
  )
  const criminalRecordUpdate = cf?.filter(
    (file) => file.category === CaseFileCategory.CRIMINAL_RECORD_UPDATE,
  )

  return (
    <>
      <SectionHeading title={formatMessage(strings.title)} />
      {coverLetters && coverLetters.length > 0 && (
        <Box marginBottom={5}>
          <Text variant="h4" as="h4" marginBottom={1}>
            {formatMessage(caseFiles.coverLetterSection)}
          </Text>
          <RenderFiles
            caseFiles={coverLetters}
            onOpenFile={onOpen}
            workingCase={workingCase}
          />
        </Box>
      )}
      {indictments && indictments.length > 0 && (
        <Box marginBottom={5}>
          <Text variant="h4" as="h4" marginBottom={1}>
            {formatMessage(caseFiles.indictmentSection)}
          </Text>
          <RenderFiles
            caseFiles={indictments}
            onOpenFile={onOpen}
            workingCase={workingCase}
          />
        </Box>
      )}
      {showTrafficViolationCaseFiles && (
        <Box marginBottom={5}>
          <Text variant="h4" as="h4" marginBottom={1}>
            {formatMessage(caseFiles.indictmentSection)}
          </Text>
          <Box marginBottom={2} key={`indictment-${workingCase.id}`}>
            <PdfButton
              caseId={workingCase.id}
              title={formatMessage(caseFiles.trafficViolationIndictmentTitle)}
              pdfType={'indictment'}
              renderAs="row"
            />
          </Box>
        </Box>
      )}
      {criminalRecords && criminalRecords.length > 0 && (
        <Box marginBottom={5}>
          <Text variant="h4" as="h4" marginBottom={1}>
            {formatMessage(caseFiles.criminalRecordSection)}
          </Text>
          <RenderFiles
            caseFiles={criminalRecords}
            onOpenFile={onOpen}
            workingCase={workingCase}
          />
        </Box>
      )}
      {criminalRecordUpdate &&
        criminalRecordUpdate.length > 0 &&
        (isDistrictCourtUser(user) ||
          isPublicProsecutor(user) ||
          isPublicProsecutorUser(user)) && (
          <Box marginBottom={5}>
            <Text variant="h4" as="h4" marginBottom={1}>
              {formatMessage(caseFiles.criminalRecordUpdateSection)}
            </Text>
            <RenderFiles
              caseFiles={criminalRecordUpdate}
              onOpenFile={onOpen}
              workingCase={workingCase}
            />
          </Box>
        )}
      {costBreakdowns && costBreakdowns.length > 0 && (
        <Box marginBottom={5}>
          <Text variant="h4" as="h4" marginBottom={1}>
            {formatMessage(caseFiles.costBreakdownSection)}
          </Text>
          <RenderFiles
            caseFiles={costBreakdowns}
            onOpenFile={onOpen}
            workingCase={workingCase}
          />
        </Box>
      )}
      {others && others.length > 0 && (
        <Box marginBottom={5}>
          <Text variant="h4" as="h4" marginBottom={1}>
            {formatMessage(caseFiles.otherDocumentsSection)}
          </Text>
          <RenderFiles
            caseFiles={others}
            onOpenFile={onOpen}
            workingCase={workingCase}
          />
        </Box>
      )}

      <Box marginBottom={5}>
        <Text variant="h4" as="h4" marginBottom={1}>
          {formatMessage(strings.caseFileTitle)}
        </Text>
        {workingCase.policeCaseNumbers?.map((policeCaseNumber, index) => (
          <Box marginBottom={2} key={`${policeCaseNumber}-${index}`}>
            <PdfButton
              caseId={workingCase.id}
              title={formatMessage(strings.caseFileButtonText, {
                policeCaseNumber,
              })}
              pdfType={'caseFilesRecord'}
              policeCaseNumber={policeCaseNumber}
              renderAs="row"
            />
          </Box>
        ))}
      </Box>
      {isDistrictCourtUser(user) || isCompletedCase(workingCase.state) ? (
        <>
          {courtRecords && courtRecords.length > 0 && (
            <Box marginBottom={5}>
              <Text variant="h4" as="h4" marginBottom={1}>
                {formatMessage(strings.courtRecordTitle)}
              </Text>
              <RenderFiles
                caseFiles={courtRecords}
                onOpenFile={onOpen}
                workingCase={workingCase}
              />
            </Box>
          )}
          {rulings && rulings.length > 0 && (
            <Box marginBottom={5}>
              <Text variant="h4" as="h4" marginBottom={1}>
                {formatMessage(strings.rulingTitle)}
              </Text>
              <RenderFiles
                caseFiles={rulings}
                onOpenFile={onOpen}
                workingCase={workingCase}
              />
            </Box>
          )}
        </>
      ) : null}
      <AnimatePresence>
        {fileNotFound && <FileNotFoundModal dismiss={dismissFileNotFound} />}
      </AnimatePresence>
    </>
  )
}

export default IndictmentCaseFilesList
