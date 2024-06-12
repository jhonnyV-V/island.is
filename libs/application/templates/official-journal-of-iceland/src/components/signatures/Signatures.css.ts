import { theme } from '@island.is/island-ui/theme'
import { globalStyle, style } from '@vanilla-extract/css'

const spacing = theme.spacing[2]
export const tabWrapper = style({
  paddingTop: spacing * 2,
  background: theme.color.white,
})

export const signatureWrapper = style({
  paddingBlockStart: spacing * 2,
  background: theme.color.white,
})

export const wrapper = style({
  width: '100%',
  padding: spacing,
  border: `1px solid ${theme.color.blue200}`,
  borderRadius: theme.border.radius.large,
})

export const institutionWrapper = style({})

export const institution = style({
  display: 'flex',
  gap: spacing,
  marginBottom: spacing,

  '@media': {
    [`screen and (max-width: ${theme.breakpoints.lg}px)`]: {
      flexDirection: 'column',
    },
  },
})

export const inputGroup = style({
  display: 'flex',
  gap: spacing,

  '@media': {
    [`screen and (max-width: ${theme.breakpoints.lg}px)`]: {
      flexDirection: 'column',
    },
  },
})

export const inputWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  flex: 1,
  gap: spacing,
})

export const removeInputGroup = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  width: 48,
  marginInlineEnd: spacing,
})

export const addSignatureWrapper = style({
  marginTop: spacing,
})

globalStyle(`${inputGroup} + ${inputGroup}`, {
  position: 'relative',
  marginTop: spacing * 2,
})

globalStyle(`${inputGroup} + ${inputGroup}::before`, {
  content: '',
  position: 'absolute',
  top: -spacing,
  left: 0,
  width: '100%',
  height: 1,
  backgroundColor: theme.color.blue200,
})

globalStyle(`${institutionWrapper} + ${institutionWrapper}`, {
  position: 'relative',
  marginTop: spacing * 4,
})

globalStyle(`${institutionWrapper} + ${institutionWrapper}::before`, {
  content: '',
  position: 'absolute',
  top: -spacing * 2,
  left: 0,
  width: '100%',
  height: 1,
  backgroundColor: theme.color.blue200,
})
