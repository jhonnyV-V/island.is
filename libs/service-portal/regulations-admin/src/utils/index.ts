import { useLocale as _useLocale } from '@island.is/localization'
import { getHolidays } from 'fridagar'
import { ISODate, toISODate } from '@island.is/regulations'
import { startOfDay } from 'date-fns/esm'

type DateFormatter = ReturnType<typeof _useLocale>['formatDateFns']

export const useLocale = () => {
  const data = _useLocale()
  const _formatDateFns = data.formatDateFns
  const formatDateFns: DateFormatter = (date, format = 'PP') =>
    _formatDateFns(date, format)
  data.formatDateFns = formatDateFns

  return data
}

// ---------------------------------------------------------------------------

type IsHolidayMap = Record<string, true | undefined>
const _holidayCache: Record<number, IsHolidayMap | undefined> = {}

const getHolidayMap = (year: number): IsHolidayMap => {
  let yearHolidays = _holidayCache[year]
  if (!yearHolidays) {
    const holidayMap: IsHolidayMap = {}
    getHolidays(year).forEach((holiday) => {
      holidayMap[toISODate(holiday.date)] = true
    })
    yearHolidays = _holidayCache[year] = holidayMap
  }
  return yearHolidays
}

export const isWorkday = (date: Date): boolean => {
  const wDay = date.getDay()
  if (wDay === 0 || wDay === 6) {
    return false
  }
  const holidays = getHolidayMap(date.getFullYear())
  return holidays[toISODate(date)] !== true
}

// ---------------------------------------------------------------------------

export const workingDaysUntil = (date: Date | ISODate) => {
  const targetDate = date instanceof Date ? startOfDay(date) : new Date(date)
  const refDate = startOfDay(Date.now())
  if (!(refDate.getTime() < targetDate.getTime())) {
    return { workingDayCount: 0, today: true }
  }

  let workingDayCount = 0
  while (refDate < targetDate) {
    if (isWorkday(refDate)) {
      workingDayCount += 1
    }
    refDate.setDate(refDate.getDate() + 1)
  }
  return { workingDayCount, today: false }
}
