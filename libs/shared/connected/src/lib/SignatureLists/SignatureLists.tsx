import { Box, Text, Stack, ActionCard } from '@island.is/island-ui/core'
import format from 'date-fns/format'
import { FC } from 'react'
import {
  ConnectedComponent,
  SignatureCollectionCandidate,
  SignatureCollectionListBase,
} from '@island.is/api/schema'
import { useLocalization } from '../../utils'
import {
  useGetCurrentCollection,
  useGetOpenLists,
} from './useGetSignatureLists'

interface SignatureListsProps {
  slice: ConnectedComponent
}

export const SignatureLists: FC<
  React.PropsWithChildren<SignatureListsProps>
> = ({ slice }) => {
  const { collection, loading } = useGetCurrentCollection()
  const { openLists, openListsLoading } = useGetOpenLists(collection?.id || '')
  const t = useLocalization(slice.json)

  return (
    !loading &&
    !openListsLoading && (
      <Box marginTop={7}>
        {(collection?.candidates.length > 0 || openLists?.length > 0) && (
          <Box marginBottom={3}>
            <Text variant="h4">
              {t('title', 'Frambjóðendur sem hægt er að mæla með')}
            </Text>
          </Box>
        )}
        <Stack space={4}>
          {/* if collection time is over yet there are still open lists, show them */}
          {new Date() > new Date(collection.endTime) &&
          openLists?.length > 0 ? (
            openLists?.map((list: SignatureCollectionListBase) => {
              return (
                <ActionCard
                  eyebrow={
                    t('openTil', 'Lokadagur:') +
                    ' ' +
                    format(new Date(list.endTime), 'dd.MM.yyyy')
                  }
                  key={list.id}
                  backgroundColor="white"
                  heading={list.title}
                  text={t('collectionName', 'Forsetakosningar 2024')}
                  cta={{
                    label: t('sign', 'Mæla með framboði'),
                    variant: 'text',
                    icon: 'open',
                    iconType: 'outline',
                    size: 'small',
                    onClick: () =>
                      window.open(
                        `${window.location.origin}${list.slug}`,
                        '_blank',
                      ),
                  }}
                />
              )
            })
          ) : collection?.candidates.length > 0 ? (
            collection.candidates.map(
              (candidate: SignatureCollectionCandidate) => {
                return (
                  <ActionCard
                    eyebrow={
                      t('openTil', 'Lokadagur:') +
                      ' ' +
                      format(new Date(collection.endTime), 'dd.MM.yyyy')
                    }
                    key={candidate.id}
                    backgroundColor="white"
                    heading={candidate.name}
                    text={t('collectionName', 'Forsetakosningar 2024')}
                    cta={
                      new Date() < new Date(collection.endTime)
                        ? {
                            label: t('sign', 'Mæla með framboði'),
                            variant: 'text',
                            icon: 'open',
                            iconType: 'outline',
                            size: 'small',
                            onClick: () =>
                              window.open(
                                `${window.location.origin}/umsoknir/maela-med-frambodi/?candidate=${candidate.id}`,
                                '_blank',
                              ),
                          }
                        : undefined
                    }
                    tag={
                      new Date() > new Date(collection.endTime)
                        ? {
                            label: t('closed', 'Söfnuninni lokið'),
                            variant: 'red',
                          }
                        : undefined
                    }
                  />
                )
              },
            )
          ) : (
            <Text variant="h4">
              {t('noLists', 'Engin meðmælasöfnun er í gangi í augnablikinu.')}
            </Text>
          )}
        </Stack>
      </Box>
    )
  )
}

export default SignatureLists
