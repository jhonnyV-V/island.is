import { ForbiddenException } from '@nestjs/common'

import {
  CaseAppealState,
  CaseState,
  CaseTransition,
  indictmentCases,
  investigationCases,
  restrictionCases,
} from '@island.is/judicial-system/types'

import { transitionCase } from './case.state'

describe('Transition Case', () => {
  describe.each(indictmentCases)('open %s - should open', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not open',
      (fromState) => {
        // Arrange
        const act = () => transitionCase(CaseTransition.OPEN, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'open %s',
    (type) => {
      const allowedFromStates = [CaseState.NEW]
      const allowedFromAppealStates = [undefined]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should open',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.OPEN,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ state: CaseState.DRAFT })
          },
        )

        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not open',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.OPEN,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not open',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.OPEN,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('ask for confirmation %s', (type) => {
    const allowedFromStates = [CaseState.DRAFT, CaseState.SUBMITTED]

    describe.each(allowedFromStates)(
      'state %s - should ask for confirmation',
      (fromState) => {
        // Act
        const res = transitionCase(
          CaseTransition.ASK_FOR_CONFIRMATION,
          type,
          fromState,
        )

        // Assert
        expect(res).toEqual({ state: CaseState.WAITING_FOR_CONFIRMATION })
      },
    )

    describe.each(
      Object.values(CaseState).filter(
        (state) => !allowedFromStates.includes(state),
      ),
    )('state %s - should not ask for confirmation', (fromState) => {
      // Arrange
      const act = () =>
        transitionCase(CaseTransition.ASK_FOR_CONFIRMATION, type, fromState)

      // Act and assert
      expect(act).toThrow(ForbiddenException)
    })
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'ask for confirmation %s',
    (type) => {
      describe.each(Object.values(CaseState))('state %s', (fromState) => {
        it.each([undefined, ...Object.values(CaseAppealState)])(
          'appeal state %s - should not ask for confirmation',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.ASK_FOR_CONFIRMATION,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('deny indictment %s', (type) => {
    const allowedFromStates = [CaseState.WAITING_FOR_CONFIRMATION]

    describe.each(allowedFromStates)(
      'state %s - should deny indictment',
      (fromState) => {
        // Act
        const res = transitionCase(
          CaseTransition.DENY_INDICTMENT,
          type,
          fromState,
        )

        // Assert
        expect(res).toEqual({ state: CaseState.DRAFT })
      },
    )

    describe.each(
      Object.values(CaseState).filter(
        (state) => !allowedFromStates.includes(state),
      ),
    )('state %s - should not deny indictment', (fromState) => {
      // Arrange
      const act = () =>
        transitionCase(CaseTransition.DENY_INDICTMENT, type, fromState)

      // Act and assert
      expect(act).toThrow(ForbiddenException)
    })
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'deny indictment %s',
    (type) => {
      describe.each(Object.values(CaseState))('state %s', (fromState) => {
        it.each([undefined, ...Object.values(CaseAppealState)])(
          'appeal state %s - should not deny indictment',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.DENY_INDICTMENT,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('submit %s', (type) => {
    const allowedFromStates = [CaseState.WAITING_FOR_CONFIRMATION]

    describe.each(allowedFromStates)(
      'state %s - should submit',
      (fromState) => {
        // Act
        const res = transitionCase(CaseTransition.SUBMIT, type, fromState)

        // Assert
        expect(res).toEqual({ state: CaseState.SUBMITTED })
      },
    )

    describe.each(
      Object.values(CaseState).filter(
        (state) => !allowedFromStates.includes(state),
      ),
    )('state %s - should not submit', (fromState) => {
      // Arrange
      const act = () => transitionCase(CaseTransition.SUBMIT, type, fromState)

      // Act and assert
      expect(act).toThrow(ForbiddenException)
    })
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'submit %s',
    (type) => {
      const allowedFromStates = [CaseState.DRAFT]
      const allowedFromAppealStates = [undefined]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should submit',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.SUBMIT,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ state: CaseState.SUBMITTED })
          },
        )

        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not submit',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.SUBMIT,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not submit',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.SUBMIT,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('ask for cancellation %s', (type) => {
    const allowedFromStates = [CaseState.SUBMITTED, CaseState.RECEIVED]

    describe.each(allowedFromStates)(
      'state %s - should ask for cancellation',
      (fromState) => {
        // Act
        const res = transitionCase(
          CaseTransition.ASK_FOR_CANCELLATION,
          type,
          fromState,
        )

        // Assert
        expect(res).toEqual({ state: CaseState.WAITING_FOR_CANCELLATION })
      },
    )

    describe.each(
      Object.values(CaseState).filter(
        (state) => !allowedFromStates.includes(state),
      ),
    )('state %s - should not ask for cancellation', (fromState) => {
      // Arrange
      const act = () =>
        transitionCase(CaseTransition.ASK_FOR_CANCELLATION, type, fromState)

      // Act and assert
      expect(act).toThrow(ForbiddenException)
    })
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'ask for cancellation %s',
    (type) => {
      describe.each(Object.values(CaseState))('state %s', (fromState) => {
        it.each([undefined, ...Object.values(CaseAppealState)])(
          'appeal state %s - should not ask for cancellation',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.ASK_FOR_CANCELLATION,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('receive %s', (type) => {
    const allowedFromStates = [CaseState.SUBMITTED]

    describe.each(allowedFromStates)(
      'state %s - should receive',
      (fromState) => {
        // Act
        const res = transitionCase(CaseTransition.RECEIVE, type, fromState)

        // Assert
        expect(res).toEqual({ state: CaseState.RECEIVED })
      },
    )

    describe.each(
      Object.values(CaseState).filter(
        (state) => !allowedFromStates.includes(state),
      ),
    )('state %s - should not receive', (fromState) => {
      // Arrange
      const act = () => transitionCase(CaseTransition.RECEIVE, type, fromState)

      // Act and assert
      expect(act).toThrow(ForbiddenException)
    })
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'receive %s',
    (type) => {
      const allowedFromStates = [CaseState.SUBMITTED]
      const allowedFromAppealStates = [undefined]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should receive',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.RECEIVE,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ state: CaseState.RECEIVED })
          },
        )

        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not receive',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.RECEIVE,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not receive',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.RECEIVE,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('return indictment %s', (type) => {
    const allowedFromStates = [CaseState.RECEIVED]

    describe.each(allowedFromStates)(
      'state %s - should return indictment',
      (fromState) => {
        // Act
        const res = transitionCase(
          CaseTransition.RETURN_INDICTMENT,
          type,
          fromState,
        )

        // Assert
        expect(res).toEqual({ state: CaseState.DRAFT })
      },
    )

    describe.each(
      Object.values(CaseState).filter(
        (state) => !allowedFromStates.includes(state),
      ),
    )('state %s - should not return indictment', (fromState) => {
      // Arrange
      const act = () =>
        transitionCase(CaseTransition.RETURN_INDICTMENT, type, fromState)

      // Act and assert
      expect(act).toThrow(ForbiddenException)
    })
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'return indictment %s',
    (type) => {
      describe.each(Object.values(CaseState))('state %s', (fromState) => {
        it.each([undefined, ...Object.values(CaseAppealState)])(
          'appeal state %s - should not return indictment',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.RETURN_INDICTMENT,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('redistribute %s', (type) => {
    const allowedFromStates = [CaseState.RECEIVED]

    describe.each(allowedFromStates)(
      'state %s - should redistribute',
      (fromState) => {
        // Act
        const res = transitionCase(CaseTransition.REDISTRIBUTE, type, fromState)

        // Assert
        expect(res).toEqual({ state: CaseState.MAIN_HEARING })
      },
    )

    describe.each(
      Object.values(CaseState).filter(
        (state) => !allowedFromStates.includes(state),
      ),
    )('state %s - should not redistribute', (fromState) => {
      // Arrange
      const act = () =>
        transitionCase(CaseTransition.REDISTRIBUTE, type, fromState)

      // Act and assert
      expect(act).toThrow(ForbiddenException)
    })
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'redistribute %s',
    (type) => {
      describe.each(Object.values(CaseState))('state %s', (fromState) => {
        it.each([undefined, ...Object.values(CaseAppealState)])(
          'appeal state %s - should not redistribute',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.REDISTRIBUTE,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('complete %s', (type) => {
    const allowedFromStates = [
      CaseState.WAITING_FOR_CANCELLATION,
      CaseState.RECEIVED,
    ]

    describe.each(allowedFromStates)(
      'state %s - should complete',
      (fromState) => {
        // Act
        const res = transitionCase(CaseTransition.COMPLETE, type, fromState)

        // Assert
        expect(res).toEqual({ state: CaseState.COMPLETED })
      },
    )

    describe.each(
      Object.values(CaseState).filter(
        (state) => !allowedFromStates.includes(state),
      ),
    )('state %s - should not complete', (fromState) => {
      // Arrange
      const act = () => transitionCase(CaseTransition.COMPLETE, type, fromState)

      // Act and assert
      expect(act).toThrow(ForbiddenException)
    })
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'complete %s',
    (type) => {
      describe.each(Object.values(CaseState))('state %s', (fromState) => {
        it.each([undefined, ...Object.values(CaseAppealState)])(
          'appeal state %s - should not complete',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.COMPLETE,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('accept %s', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not accept',
      (fromState) => {
        // Arrange
        const act = () => transitionCase(CaseTransition.ACCEPT, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'accept %s',
    (type) => {
      const allowedFromStates = [CaseState.RECEIVED]
      const allowedFromAppealStates = [
        undefined,
        ...Object.values(CaseAppealState),
      ]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should accept',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.ACCEPT,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ state: CaseState.ACCEPTED })
          },
        )
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not accept',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.ACCEPT,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('reject %s', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not reject',
      (fromState) => {
        // Arrange
        const act = () => transitionCase(CaseTransition.REJECT, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'reject %s',
    (type) => {
      const allowedFromStates = [CaseState.RECEIVED]
      const allowedFromAppealStates = [
        undefined,
        ...Object.values(CaseAppealState),
      ]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should reject',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.REJECT,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ state: CaseState.REJECTED })
          },
        )
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not reject',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.REJECT,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('dismiss %s', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not dismiss',
      (fromState) => {
        // Arrange
        const act = () =>
          transitionCase(CaseTransition.DISMISS, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'dismiss %s',
    (type) => {
      const allowedFromStates = [CaseState.RECEIVED]
      const allowedFromAppealStates = [
        undefined,
        ...Object.values(CaseAppealState),
      ]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should dismiss',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.DISMISS,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ state: CaseState.DISMISSED })
          },
        )
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not dismiss',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.DISMISS,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('delete %s', (type) => {
    const allowedFromStates = [
      CaseState.DRAFT,
      CaseState.WAITING_FOR_CONFIRMATION,
    ]

    describe.each(allowedFromStates)(
      'state %s - should delete',
      (fromState) => {
        // Act
        const res = transitionCase(CaseTransition.DELETE, type, fromState)

        // Assert
        expect(res).toEqual({ state: CaseState.DELETED })
      },
    )

    describe.each(
      Object.values(CaseState).filter(
        (state) => !allowedFromStates.includes(state),
      ),
    )('state %s - should not delete', (fromState) => {
      // Arrange
      const act = () => transitionCase(CaseTransition.DELETE, type, fromState)

      // Act and assert
      expect(act).toThrow(ForbiddenException)
    })
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'delete %s',
    (type) => {
      const allowedFromStates = [
        CaseState.NEW,
        CaseState.DRAFT,
        CaseState.SUBMITTED,
        CaseState.RECEIVED,
      ]
      const allowedFromAppealStates = [undefined]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should delete',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.DELETE,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ state: CaseState.DELETED })
          },
        )

        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not delete',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.DELETE,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not delete',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.DELETE,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('reopen %s', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not reopen',
      (fromState) => {
        // Arrange
        const act = () => transitionCase(CaseTransition.REOPEN, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'reopen %s',
    (type) => {
      const allowedFromStates = [
        CaseState.ACCEPTED,
        CaseState.REJECTED,
        CaseState.DISMISSED,
      ]
      const allowedFromAppealStates = [
        undefined,
        ...Object.values(CaseAppealState),
      ]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should reopen',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.REOPEN,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ state: CaseState.RECEIVED })
          },
        )
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not reopen',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.REOPEN,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('appeal %s', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not appeal',
      (fromState) => {
        // Arrange
        const act = () => transitionCase(CaseTransition.APPEAL, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'appeal %s',
    (type) => {
      const allowedFromStates = [
        CaseState.ACCEPTED,
        CaseState.REJECTED,
        CaseState.DISMISSED,
      ]
      const allowedFromAppealStates = [undefined]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should appeal',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.APPEAL,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ appealState: CaseAppealState.APPEALED })
          },
        )

        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not appeal',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.APPEAL,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not appeal',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.APPEAL,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('withdraw appeal %s', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not withdraw appeal',
      (fromState) => {
        // Arrange
        const act = () =>
          transitionCase(CaseTransition.WITHDRAW_APPEAL, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'withdraw appeal %s',
    (type) => {
      const allowedFromStates = [
        CaseState.ACCEPTED,
        CaseState.REJECTED,
        CaseState.DISMISSED,
      ]
      const allowedFromAppealStates = [
        CaseAppealState.APPEALED,
        CaseAppealState.RECEIVED,
      ]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should withdraw appeal',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.WITHDRAW_APPEAL,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ appealState: CaseAppealState.WITHDRAWN })
          },
        )

        it.each(
          Object.values(CaseAppealState).filter(
            (appealState) => !allowedFromAppealStates.includes(appealState),
          ),
        )('appeal state %s - should not withdraw appeal', (fromAppealState) => {
          // Arrange
          const act = () =>
            transitionCase(
              CaseTransition.WITHDRAW_APPEAL,
              type,
              fromState,
              fromAppealState,
            )

          // Act and assert
          expect(act).toThrow(ForbiddenException)
        })
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not withdraw appeal',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.WITHDRAW_APPEAL,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('receive appeal %s', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not receive appeal',
      (fromState) => {
        // Arrange
        const act = () =>
          transitionCase(CaseTransition.RECEIVE_APPEAL, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'receive appeal %s',
    (type) => {
      const allowedFromStates = [
        CaseState.ACCEPTED,
        CaseState.REJECTED,
        CaseState.DISMISSED,
      ]
      const allowedFromAppealStates = [CaseAppealState.APPEALED]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should receive appeal',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.RECEIVE_APPEAL,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ appealState: CaseAppealState.RECEIVED })
          },
        )

        it.each(
          Object.values(CaseAppealState).filter(
            (appealState) => !allowedFromAppealStates.includes(appealState),
          ),
        )('appeal state %s - should not receive appeal', (fromAppealState) => {
          // Arrange
          const act = () =>
            transitionCase(
              CaseTransition.RECEIVE_APPEAL,
              type,
              fromState,
              fromAppealState,
            )

          // Act and assert
          expect(act).toThrow(ForbiddenException)
        })
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not receive appeal',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.RECEIVE_APPEAL,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('complete appeal %s', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not complete appeal',
      (fromState) => {
        // Arrange
        const act = () =>
          transitionCase(CaseTransition.COMPLETE_APPEAL, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'complete appeal %s',
    (type) => {
      const allowedFromStates = [
        CaseState.ACCEPTED,
        CaseState.REJECTED,
        CaseState.DISMISSED,
      ]
      const allowedFromAppealStates = [
        CaseAppealState.RECEIVED,
        CaseAppealState.WITHDRAWN,
      ]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should complete appeal',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.COMPLETE_APPEAL,
              type,
              fromState,
              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ appealState: CaseAppealState.COMPLETED })
          },
        )

        it.each(
          Object.values(CaseAppealState).filter(
            (appealState) => !allowedFromAppealStates.includes(appealState),
          ),
        )('appeal state %s - should not complete appeal', (fromAppealState) => {
          // Arrange
          const act = () =>
            transitionCase(
              CaseTransition.COMPLETE_APPEAL,
              type,
              fromState,
              fromAppealState,
            )

          // Act and assert
          expect(act).toThrow(ForbiddenException)
        })
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not complete appeal',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.COMPLETE_APPEAL,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )

  describe.each(indictmentCases)('reopen appeal %s', (type) => {
    describe.each(Object.values(CaseState))(
      'state %s - should not reopen appeal',
      (fromState) => {
        // Arrange
        const act = () =>
          transitionCase(CaseTransition.REOPEN_APPEAL, type, fromState)

        // Act and assert
        expect(act).toThrow(ForbiddenException)
      },
    )
  })

  describe.each([...restrictionCases, ...investigationCases])(
    'reopen appeal %s',
    (type) => {
      const allowedFromStates = [
        CaseState.ACCEPTED,
        CaseState.REJECTED,
        CaseState.DISMISSED,
      ]
      const allowedFromAppealStates = [CaseAppealState.COMPLETED]

      describe.each(allowedFromStates)('state %s', (fromState) => {
        it.each(allowedFromAppealStates)(
          'appeal state %s - should reopen appeal',
          (fromAppealState) => {
            // Act
            const res = transitionCase(
              CaseTransition.REOPEN_APPEAL,
              type,
              fromState,

              fromAppealState,
            )

            // Assert
            expect(res).toEqual({ appealState: CaseAppealState.RECEIVED })
          },
        )

        it.each(
          Object.values(CaseAppealState).filter(
            (appealState) => !allowedFromAppealStates.includes(appealState),
          ),
        )('appeal state %s - should not reopen appeal', (fromAppealState) => {
          // Arrange
          const act = () =>
            transitionCase(
              CaseTransition.REOPEN_APPEAL,
              type,
              fromState,

              fromAppealState,
            )

          // Act and assert
          expect(act).toThrow(ForbiddenException)
        })
      })

      describe.each(
        Object.values(CaseState).filter(
          (state) => !allowedFromStates.includes(state),
        ),
      )('state %s', (fromState) => {
        it.each(Object.values(CaseAppealState))(
          'appeal state %s - should not reopen appeal',
          (fromAppealState) => {
            // Arrange
            const act = () =>
              transitionCase(
                CaseTransition.REOPEN_APPEAL,
                type,
                fromState,
                fromAppealState,
              )

            // Act and assert
            expect(act).toThrow(ForbiddenException)
          },
        )
      })
    },
  )
})
