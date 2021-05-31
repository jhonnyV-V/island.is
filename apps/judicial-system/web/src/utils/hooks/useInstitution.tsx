import { useQuery } from '@apollo/client'
import { Institution, InstitutionType } from '@island.is/judicial-system/types'
import { InstitutionsQuery } from '@island.is/judicial-system-web/src/utils/mutations'

let rawInstitutions: Institution[]

interface InstitutionData {
  institutions: Institution[]
}

const institutions: {
  courts: Institution[]
  defaultCourt: Institution | undefined
  prosecutorsOffices: Institution[]
  loaded: boolean
} = {
  courts: [],
  defaultCourt: undefined,
  prosecutorsOffices: [],
  loaded: false,
}

const useInstitution = () => {
  const { data, loading } = useQuery<InstitutionData>(InstitutionsQuery, {
    skip: Boolean(rawInstitutions),
  })

  if (data && data.institutions && !rawInstitutions) {
    rawInstitutions = data.institutions

    institutions.courts = rawInstitutions.filter(
      (institution) => institution.type === InstitutionType.COURT,
    )

    institutions.defaultCourt = institutions.courts.find(
      (institution) => institution.name === 'Héraðsdómur Reykjavíkur',
    )

    institutions.prosecutorsOffices = rawInstitutions.filter(
      (institution) => institution.type === InstitutionType.PROSECUTORS_OFFICE,
    )

    institutions.loaded = true
  }

  return { ...institutions, loading }
}

export default useInstitution
