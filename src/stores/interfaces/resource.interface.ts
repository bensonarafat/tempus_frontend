import type { Event } from './event.interface'
import type { User } from './user.interface'

export interface Resource {
  id: number
  event_id: number
  media_type: string
  url: string
  source?: string
  created_at: string
  updated_at: string
  users: User
  events: Event
}

export interface ResourceCreateDto {
  event_id: number
  media_type: string
  source?: string | null
  author_id?: number
}

export interface ResourceUpdateDto {
  event_id: number
  media_type: string
  source?: string | null
}
