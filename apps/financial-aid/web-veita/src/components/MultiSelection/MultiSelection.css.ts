import { style } from '@vanilla-extract/css'
import { theme } from '@island.is/island-ui/theme'

export const tags = style({
  backgroundColor: theme.color.blue100,
  marginRight: theme.spacing[2],
  borderRadius: theme.spacing[1],
})
