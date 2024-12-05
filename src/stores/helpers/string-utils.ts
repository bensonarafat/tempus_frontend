/**
 * Generates a URL-friendly slug from a given string
 * @param name the input string to convert to a slug
 * @returns A cleaned, lowercase slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase() // Conver to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by checking against existing items
 * @param name The input string to conver to a slug
 * @param exisitingItems Array of items to check for slug uniqueness
 * @param getSlug Optional function to extract slug from existing items
 * @returns A unique slug
 */
export function generateUniqueSlug(
  name: string,
  existingItems: any[],
  getSlug: (item: any) => string = (item) => item.slug,
): string {
  let baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  // Check if slug already exists
  while (existingItems.some((item) => getSlug(item) === slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
