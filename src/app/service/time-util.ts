import moment from 'moment'

export function firebaseToMomentDate(fb: any): moment.Moment | undefined {
  if (!fb) {
    return undefined
  }
  // usually it is firebase.firestore.Timestamp
  if (typeof fb.toDate === 'function') {
    return moment(fb.toDate())
  } else {
    return moment(fb)
  }
}

export function firebaseToDate(fb: any): Date | undefined {
  if (!fb) {
    return undefined
  }

  if (typeof fb.toDate === 'function') {
    return fb.toDate()
  } else {
    console.warn('Could not parse object to date', fb)
    return undefined
  }
}
