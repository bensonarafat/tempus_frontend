export type UserRole = 'user' | 'staff' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: number
  email: string
  username: string
  role: UserRole
  token?: string
  fullname: string
  dataOfBirth?: Date
  gender?: string
  profilePictureUrl?: string
  phoneNumber?: string
  status: UserStatus
  emailVerified: boolean
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// DTO (Date Transfer Object) for user creation
export interface CreateUserDto {}

// DTO for user update
export interface UpdateUserDto {}
