export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface AddressSelectedPayload {
  formattedAddress: string
  coordinates: {
    lat: number
    lng: number
  }
  parsedAddress: Address
}
