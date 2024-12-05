export function getFormatedDate(date: string | undefined): string {
  if (!date) return 'N/A'

  const _date = new Date(date)

  // Create a function to add ordinal suffix to day
  const addOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return day + 'th'
    switch (day % 10) {
      case 1:
        return day + 'st'
      case 2:
        return day + 'nd'
      case 3:
        return day + 'rd'
      default:
        return day + 'th'
    }
  }

  // Format options
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }

  // Custom formatting
  const formattedDate = _date.toLocaleString('en-US', options)

  // Replace the day with ordinal day
  const dayWithOrdinal = addOrdinalSuffix(_date.getDate())

  // Split the formatted date and reconstruct
  const parts = formattedDate.split(',')
  const [month, day] = parts[0].split(' ')

  return `${dayWithOrdinal} ${month}, ${parts[1].trim()}`
}
