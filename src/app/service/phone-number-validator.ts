import { AbstractControl, ValidatorFn } from '@angular/forms';

const hunPhoneRegexp = /^\+[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\d]{9}$/

export const hunPhoneNumberValidator: ValidatorFn = (control: AbstractControl) => {
  const { value } = control
  if (value) {
    if (hunPhoneRegexp.test(value)) {
      return null
    } else {
      return { invalid: 'Nem megfelelő telefonszám formátum' }
    }
  } else {
    return { required: 'Telefonszám üres' }
  }
}
