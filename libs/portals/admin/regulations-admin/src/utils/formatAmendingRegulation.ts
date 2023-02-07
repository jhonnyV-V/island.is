import { asDiv, HTMLText, RegName } from '@island.is/regulations'
import qq from '@hugsmidjan/qj/qq'
import {
  DraftImpactForm,
  GroupedDraftImpactForms,
  RegDraftForm,
} from '../state/types'
import { DraftImpactName } from '@island.is/regulations/admin'
import flatten from 'lodash/flatten'

// ----------------------------------------------------------------------
const PREFIX = 'Reglugerð um '
const PREFIX_AMENDING = 'breytingu á reglugerð nr. '
const PREFIX_REPEALING = 'brottfellingu á reglugerð nr. ' // repealingTitleRe

const removeRegPrefix = (title: string) => {
  if (/^Reglugerð/.test(title)) {
    return title.replace(/^Reglugerð/, '')
  }
  return title
}

export const formatAmendingRegTitle = (draft: RegDraftForm) => {
  const impactArray = Object.values(draft.impacts)

  if (impactArray.length > 0) {
    const titleArray = impactArray.flat()

    const amendingArray = titleArray.filter((item) => item.type === 'amend')
    const repealArray = titleArray.filter((item) => item.type === 'repeal')

    const amendingTitles = amendingArray.map(
      (item, i) =>
        `${i === 0 ? `${PREFIX_AMENDING}` : ''} ${item.name}${removeRegPrefix(
          item.regTitle,
        )}`,
    )

    const repealTitles = repealArray.map(
      (item, i) =>
        `${i === 0 ? `${PREFIX_REPEALING}` : ''} ${item.name}${removeRegPrefix(
          item.regTitle,
        )}`,
    )

    return PREFIX + [...amendingTitles, ...repealTitles].join(' og ')
  }

  return PREFIX
}

// ----------------------------------------------------------------------

const getLiPoint = (num: number, isStaflidur: boolean) => {
  const charNum = num > 22 ? 23 : num - 1
  const bulletPoint = isStaflidur ? String.fromCharCode(97 + charNum) : num

  return bulletPoint
}

// List item recursion for nested lists
const formatListItemDiff = (item: Element) => {
  let oldLiText = ''
  let newLiText = ''
  let liItemHtml = '' as HTMLText
  let lidur = 0
  qq('ol > li', item).forEach((liItem) => {
    lidur++

    const liHasDeletion = !!liItem.querySelector('del')
    const liHasInsert = !!liItem.querySelector('ins')

    if (liHasDeletion || liHasInsert) {
      const oldLiElement = liItem.cloneNode(true) as Element
      oldLiElement.querySelectorAll('ins').forEach((e) => e.remove())
      oldLiText = oldLiElement.textContent || ''

      const newLiElement = liItem.cloneNode(true) as Element
      newLiElement.querySelectorAll('del').forEach((e) => e.remove())
      newLiText = newLiElement.textContent || ''

      const directArray = Array.from(liItem.children)
      const containsDirect = directArray.find((e) =>
        e.classList.contains('diffdel'),
      )

      const isStaflidur =
        liItem?.parentElement?.getAttribute('type')?.toLowerCase() === 'a'

      if (containsDirect) {
        liItemHtml = (liItemHtml + formatListItemDiff(liItem)) as HTMLText
      } else {
        liItemHtml = (liItemHtml +
          `${isStaflidur ? 'Stafliður' : 'Töluliður'} ${getLiPoint(
            lidur,
            isStaflidur,
          )}, `) as HTMLText
        formatListItemDiff(liItem)
        lidur = 0
        return
      }

      const isLiDeleted = newLiText === '' || newLiText === null

      if (isLiDeleted) {
        liItemHtml = (liItemHtml +
          `${isStaflidur ? 'staflið' : 'tölulið'} ${getLiPoint(
            lidur,
            isStaflidur,
          )}, ${oldLiText} hefur verið eytt út. Eftirkomandi röðun ${
            isStaflidur ? 'stafliða' : 'töluliða'
          } breytist m.t.t. þessara breytinga.`) as HTMLText
      } else {
        liItemHtml = (liItemHtml +
          `${isStaflidur ? 'Stafliður' : 'Töluliður'} ${getLiPoint(
            lidur,
            isStaflidur,
          )} verður nú: ${newLiText}`) as HTMLText
      }
    }
  })
  return `${liItemHtml}`
}

export const formatAmendingRegBody = (
  regName: string,
  repeal?: boolean,
  diff?: HTMLText | string | undefined,
) => {
  if (repeal) {
    return [`<p>Fellir brott reglugerð nr. ${regName}</p>` as HTMLText]
  }

  if (!diff) {
    return []
  }

  const additionArray: HTMLText[] = []

  const diffString = diff as string
  const diffDiv = asDiv(diffString)
  let grein = 0
  let malsgrein = 0

  qq('div > *', diffDiv).forEach((item) => {
    // Increment grein number on every article title
    if (item.classList.contains('article__title')) {
      grein++
      malsgrein = 0
    }

    let isMalsgrein = false
    let isGreinTitle = false
    let isTolulidur = false
    let isStaflidur = false

    // Increment malsgrein number on every paragraph after article
    if (item.nodeName === 'P') {
      malsgrein++
      isMalsgrein = true
    }

    if (item.nodeName === 'H3') {
      isGreinTitle = true
    }

    if (item.nodeName === 'OL') {
      if (item.getAttribute('type')?.toLowerCase() === 'a') {
        isStaflidur = true
      } else {
        isTolulidur = true
      }
    }

    const hasDeletion = !!item.querySelector('del')
    const hasInsert = !!item.querySelector('ins')

    if (hasDeletion || hasInsert) {
      const oldTextElement = item.cloneNode(true) as Element
      const newTextElement = item.cloneNode(true) as Element
      let oldText = ''
      let newText = ''

      oldTextElement.querySelectorAll('ins').forEach((e) => e.remove())
      oldText = oldTextElement.textContent || ''

      newTextElement.querySelectorAll('del').forEach((e) => e.remove())
      newText = newTextElement.textContent || ''

      let liHtml = '' as HTMLText
      if (isStaflidur || isTolulidur) {
        liHtml = `<p>${formatListItemDiff(item)}</p>` as HTMLText
      } else {
        oldTextElement.querySelectorAll('ins').forEach((e) => e.remove())
        oldText = oldTextElement.textContent || ''

        newTextElement.querySelectorAll('del').forEach((e) => e.remove())
        newText = newTextElement.textContent || ''
      }

      const isDeleted = newText === '' || newText === null

      const regNameDisplay =
        regName && regName !== 'self'
          ? `reglugerðar ${regName}`
          : 'reglugerðarinnar'
      let pushHtml = '' as HTMLText
      if (isDeleted) {
        if (isMalsgrein) {
          // Paragraph was deleted
          pushHtml = `<p>${malsgrein}. mgr. ${grein}. gr. ${regNameDisplay} er eytt út</p>` as HTMLText
        } else if (isGreinTitle) {
          // Title was deleted
          pushHtml = `<p>Titli ${grein}. gr. ${regNameDisplay} er eytt út</p>` as HTMLText
        } else if (isStaflidur || isTolulidur) {
          // List was deleted
          pushHtml = `<p>${
            isStaflidur ? 'Stafliðum' : 'Töluliðum'
          } eftir ${malsgrein}. mgr. ${grein}. gr. ${regNameDisplay} er eytt út</p>` as HTMLText
        } else {
          // We don't know what you deleted, but there was a deletion, and here's the deletelog:
          pushHtml = `<p>Texta í ${grein}. gr. ${regNameDisplay} er eytt út</p>` as HTMLText
        }
      } else {
        if (isGreinTitle) {
          // Title was changed
          pushHtml = `<p>Eftirfarandi breytingar verða á titli fyrir ${grein}. gr. ${regNameDisplay}:</p><p>Í stað ${oldText} kemur ${newText}</p>` as HTMLText
        } else if (isMalsgrein) {
          // Paragraph was changed
          pushHtml = `<p>Eftirfarandi breytingar verða á ${malsgrein}. mgr. ${grein}. gr. ${regNameDisplay}:</p><p>Málsgreinin verður svohljóðandi: ${newText}</p>` as HTMLText
        } else if (isStaflidur || isTolulidur) {
          // List was changed
          pushHtml = `<p>Eftirfarandi breytingar verða á ${
            isStaflidur ? 'Staflið' : 'Tölulið'
          } eftir ${malsgrein}. mgr. ${grein}. gr. ${regNameDisplay}: ${liHtml}` as HTMLText
        } else {
          // We don't know what you changed, but there was a change, and here's the changelog:
          pushHtml = `<p>Eftirfarandi breytingar ${regNameDisplay} áttu sér stað:</p<p>${
            oldText ? `Í stað ${oldText} kemur ` : ''
          }${newText}</p>` as HTMLText
        }
      }
      additionArray.push(pushHtml)
    }
  })

  return additionArray
}

export const formatAmendingBodyWithArticlePrefix = (
  impactsArray: GroupedDraftImpactForms,
) => {
  const draftImpactLength = Object.entries(impactsArray).length

  const impactAdditionArray = Object.entries(impactsArray).map(
    ([key, impacts]) => {
      const impactArray = impacts.map((item, i) =>
        formatAmendingRegBody(
          draftImpactLength > 1 ? item.name : '',
          item.type === 'repeal',
          item.type === 'amend' ? item.diff?.value : undefined,
        ),
      )
      const flatArray = flatten(impactArray)
      return flatArray
    },
  )

  const additions = flatten(impactAdditionArray)

  const prependString = additions.map(
    (item, i) =>
      `<h3 class="article__title">${i + 1}. gr.</h3>${item}` as HTMLText,
  )

  return prependString
}
