import { Box, FormStepperV2, Section, Text } from '@island.is/island-ui/core'
import {
  Section as TSection,
  SectionChildren,
  Application,
} from '@island.is/application/types'
import { useLocale } from '@island.is/localization'
import { MessageDescriptor } from 'react-intl'

import { FormScreen } from '../types'
import useIsMobile from '../hooks/useIsMobile'
import { ExcludesFalse } from '@island.is/application/utils'
import { formatText } from '@island.is/application/core'

type Props = {
  form: {
    title: MessageDescriptor | string
    icon?: string
  }
  sections: TSection[]
  screens: FormScreen[]
  currentScreen: FormScreen
  application: Application
}

const FormStepper = ({
  form,
  sections,
  screens,
  currentScreen,
  application,
}: Props) => {
  const { formatMessage } = useLocale()
  const { isMobile } = useIsMobile()

  const parseSubsections = (
    children: Array<SectionChildren>,
    isParentActive: boolean,
  ) => {
    if (!children || children.length === 0) {
      return []
    }

    const childrenToParse: Array<SectionChildren> = []

    children.forEach((child) => {
      const childScreen = screens.find((s) => s.id === child.id)

      if (childScreen?.subSectionIndex === -1) {
        return null
      }

      childrenToParse.push(child)
    })

    return childrenToParse.map((child, i) => {
      const isChildActive =
        isParentActive && currentScreen.subSectionIndex === i

      return (
        <Text
          variant="medium"
          fontWeight={isChildActive ? 'semiBold' : 'regular'}
          key={`formStepperChild-${i}`}
        >
          {formatText(child.title, application, formatMessage)}
        </Text>
      )
    })
  }

  const stepperTitle = isMobile ? null : (
    <Box
      marginLeft={1}
      key={`${form.title.toString}`}
      paddingBottom={[0, 0, 4]}
    >
      <Text variant="h4">{formatMessage(form.title)}</Text>
    </Box>
  )

  return (
    <FormStepperV2
      sections={
        sections &&
        [
          stepperTitle,
          ...sections.map((section, i) => (
            <Section
              key={`formStepper-${i}`}
              isActive={currentScreen.sectionIndex === i}
              section={formatText(section.title, application, formatMessage)}
              sectionIndex={i}
              subSections={
                section.children.length > 1
                  ? parseSubsections(
                      section.children,
                      currentScreen.sectionIndex === i,
                    )
                  : undefined
              }
              isComplete={currentScreen.sectionIndex > i}
            />
          )),
        ].filter(Boolean as unknown as ExcludesFalse)
      }
    />
  )
}

export default FormStepper
