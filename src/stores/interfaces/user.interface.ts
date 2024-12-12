export type UserRole = 'user' | 'staff' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: number
  fullname: string
  role: UserRole
  username: string
  email: string
  phone_number?: string
  profile_picture_url?: string
  status: UserStatus
  is_verified: boolean
  date_of_birth?: string
  gender?: string
  email_notifications?: boolean
  sms_notifications?: boolean
  last_login?: string
  uuid: string
  created_at: string
  updated_at: string
}

// DTO (Date Transfer Object) for user creation
export interface CreateUserDto {
  fullname: string
  email: string
  username: string
  phone_number?: string | null
  role: string
  password: string
}

// DTO for user update
export interface UpdateUserDto {
  fullname: string
  phone_number?: string | null
}
