import * as moment from 'moment'

export function firebaseToMomentDate(fb: any) {
  if (!fb) {
    return undefined
  }
  // usually it is firebase.firestore.Timestamp
  if (typeof fb.toDate === 'function') {
    return moment((fb as any).toDate())
  } else {
    return moment(fb)
  }
}
