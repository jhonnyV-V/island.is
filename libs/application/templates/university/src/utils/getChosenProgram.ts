import { getValueViaPath } from '@island.is/application/core'
import { ExternalData, FormValue } from '@island.is/application/types'
import { Program } from '@island.is/clients/university-gateway-api'

export const getChosenProgram = (
  externalData: ExternalData,
  answers: FormValue,
): Program | undefined => {
  const allPrograms =
    (externalData?.programs.data as Array<Program>) || undefined

  const programId = getValueViaPath(
    answers,
    'programInformation.program',
    '',
  ) as string

  return allPrograms.find((x) => x.id === programId)
}
