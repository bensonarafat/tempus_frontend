export interface Category {
  id?: number
  name: string
  slug: string
  image_url?: string
  description?: string
  created_at?: string
  updated_at?: string
}

// DTO (Date Transfer Object) for category creation
export interface CategoryDto {
  name: string
  description?: string
  updated_at?: string
}
