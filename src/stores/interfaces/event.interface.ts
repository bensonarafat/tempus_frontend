import type { Category } from './category.interface'
import type { User } from './user.interface'

export interface Event {
  id: number
  start_date: string
  end_date?: string
  image_url: string
  title: string
  slug: string
  content: string
  important: number
  source?: string
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  lat?: number
  lng?: number
  address?: string
  author_id: number
  created_at: string
  updated_at: string
  users?: User
  category_ids: number[]
  day_month: string
}

// DTO (Data Transfer Object) for event creation
export interface EventDto {
  start_date: string | null
  end_date?: string | null
  title: string
  content: string
  category_ids: number[]
  important: number
  source?: string | null
  street?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  lat?: number | null
  lng?: number | null
  address?: string | null
  author_id?: number
  day_month: string
}
// DTO (Data Transfer Object) for event update
export interface EventUpdateDto {
  title: string
  start_date: string | null
  end_date?: string | null
  content: string
  category_ids: number[]
  important: number
  source?: string | null
  street?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  lat?: number | null
  lng?: number | null
  address?: string | null
  day_month: string
}
