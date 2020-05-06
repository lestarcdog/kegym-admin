import * as moment from 'moment'

export function milestoneTimeDifference(date: moment.Moment) {
  if (date) {
    const now = moment()
    const daysDiff = date.diff(now, 'days')
    if (daysDiff === 0) {
      return ': Ma'
    } else if (daysDiff < 0) {
      return `: eltelt ${daysDiff * -1} nap`
    } else {
      return `: ${daysDiff} nap múlva`
    }
  } else {
    return ''
  }
}
