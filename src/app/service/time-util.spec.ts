import * as firebase from 'firebase'
import { firebaseToMomentDate } from './time-util'

describe('time util', () => {
  it('should handle toDate() functions', () => {
    const ts = new firebase.firestore.Timestamp(1588775000, 0)
    expect(firebaseToMomentDate(ts)).toBeDefined()
  })
})
