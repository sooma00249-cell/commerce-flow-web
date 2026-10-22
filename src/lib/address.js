/*
  Canonical address shape shared by suppliers, sale orders and purchase orders.

  The API validates `address` as a single object and reports every missing key
  in one message, so the client mirrors the same key order and limits.
*/

export const ADDRESS_KEYS = ['street', 'city', 'state', 'zipCode', 'country']

/** Max length accepted by the API for each address field. */
export const ADDRESS_LIMITS = {
  street: 200,
  city: 100,
  state: 100,
  zipCode: 20,
  country: 100,
}

export const EMPTY_ADDRESS = Object.freeze({
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
})

/** A fresh, mutable copy of the empty address. */
export function emptyAddress() {
  return { ...EMPTY_ADDRESS }
}
