import {
  Box,
  Button,
  FocusableBox,
  GridColumn,
  GridContainer,
  GridRow,
  ModalBase,
  Stack,
  useBoxStyles,
} from '@island.is/island-ui/core'
import { useState } from 'react'
import { menuItems } from '../Menu/MenuItems'
import { MenuLogo } from '../svg'

import * as styles from './MenuModal.css'

const MenuModal = ({ baseId, modalLabel, isLoggedIn, logIn, logOut }) => {
  const [isVisible, setIsVisible] = useState(false)
  const gridContainerStyles = useBoxStyles({
    component: 'div',
    background: 'blue100',
    height: 'full',
  })
  const fullHeight = useBoxStyles({ component: 'div', height: 'full' })

  return (
    <>
      <Button icon="menu" variant="utility" onClick={() => setIsVisible(true)}>
        Valmynd
      </Button>
      <ModalBase
        baseId={baseId}
        modalLabel={modalLabel}
        className={styles.container}
        backdropWhite
        isVisible={isVisible}
        onVisibilityChange={(visibility) => {
          if (visibility !== isVisible) {
            setIsVisible(visibility)
          }
        }}
      >
        {({ closeModal }: { closeModal: () => void }) => (
          <GridContainer className={gridContainerStyles}>
            <GridRow className={fullHeight}>
              <GridColumn span="12/12">
                <Box
                  paddingTop={3}
                  paddingBottom={3}
                  paddingRight={1}
                  display="flex"
                  justifyContent="center"
                  position="relative"
                >
                  <div className={styles.mainContainer}>
                    <Box
                      display="flex"
                      justifyContent="spaceBetween"
                      alignItems="center"
                    >
                      <Box>
                        <MenuLogo />
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="flexEnd"
                        alignItems="center"
                      >
                        <Button
                          icon={'close'}
                          variant="utility"
                          onClick={closeModal}
                        >
                          Loka
                        </Button>
                      </Box>
                    </Box>
                    <Box paddingTop={6}>
                      <Stack space={2}>
                        {menuItems.map((item, index) => {
                          return (
                            <FocusableBox key={index} href={item.href}>
                              <Button variant="utility" fluid size="small">
                                {item.label}
                              </Button>
                            </FocusableBox>
                          )
                        })}
                        {isLoggedIn ? (
                          <Button size="small" fluid onClick={logOut}>
                            Útskrá
                          </Button>
                        ) : (
                          <Button size="small" fluid onClick={logIn}>
                            Innskráning
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </div>
                </Box>
              </GridColumn>
            </GridRow>
          </GridContainer>
        )}
      </ModalBase>
    </>
  )
}

export default MenuModal
