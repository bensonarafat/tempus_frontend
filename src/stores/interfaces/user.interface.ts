export type UserRole = 'user' | 'staff' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'suspended'


export interface UserAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface UserProfile {
  fullname: string
  dataOfBirth?: Date
  gender?: string
  profilePictureUrl?: string
  phoneNumber?: string
}


export interface User {
  id: number
  email: string
  username: string
  role: UserRole
  token?: string
  profile: UserProfile
  status: UserStatus
  emailVerified: boolean
  address?: UserAddress

  // Permissions and preferences
  notificationPreferences?: {
      email: boolean
      sms: boolean
      pushNotifications: boolean
  }

  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// DTO (Date Transfer Object) for user creation
export interface CreateUserDto {
  email: string
  username: string
  role?: string
  profile: Omit<UserProfile, 'profilePictureUrl'> & {
    profilePicture?: File
  }
}

// DTO for user update
export interface UpdateUserDto {
  profile?: Partial<UserProfile>
  address?: Partial<UserAddress>
  notificationPreferences?: Partial<User['notificationPreferences']>
}
