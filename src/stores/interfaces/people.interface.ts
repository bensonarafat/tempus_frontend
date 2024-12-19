import type { User } from './user.interface'

export interface People {
  id: number
  name: string
  birth_date?: string
  death_date?: string
  nationality?: string
  profession?: string
  biography: string
  image_url: string
  author_id: number
  users: User
  slug: string
  created_at?: string
  updated_at?: string
  day_month: string
}

export interface PeopleCreateDto {
  name: string
  birth_date: string
  death_date?: string | null
  nationality?: string | null
  profession?: string | null
  biography: string
  author_id?: number
  day_month: string
}

export interface PeopleUpdateDto {
  name: string
  birth_date?: string
  death_date?: string | null
  nationality?: string | null
  profession?: string | null
  biography: string
  day_month: string
}
