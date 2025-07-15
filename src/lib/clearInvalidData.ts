// Utility to clear invalid countdown data from localStorage
export function clearInvalidCountdownData(): void {
  if (typeof window === 'undefined') return

  try {
    // Clear countdown data
    localStorage.removeItem('disney-countdowns')
    localStorage.removeItem('disney-current-countdown')

    // Clear widget configurations that reference countdown items
    const widgetConfigs = JSON.parse(localStorage.getItem('disney-widget-configs') || '[]')
    const cleanedConfigs = widgetConfigs.filter((config: any) => config.type !== 'countdown')
    localStorage.setItem('disney-widget-configs', JSON.stringify(cleanedConfigs))

    // Clear pending widget links
    const pendingLinks = JSON.parse(localStorage.getItem('disney-pending-widget-links') || '{}')
    const cleanedLinks = Object.fromEntries(
      Object.entries(pendingLinks).filter(([_, data]: [string, any]) => data.widgetType !== 'countdown')
    )
    localStorage.setItem('disney-pending-widget-links', JSON.stringify(cleanedLinks))

    console.log('✅ Cleared invalid countdown data from localStorage')
  } catch (error) {
    console.error('❌ Error clearing countdown data:', error)
  }
}

// Function to validate and clean countdown data
export function validateAndCleanCountdownData(): void {
  if (typeof window === 'undefined') return

  try {
    const saved = localStorage.getItem('disney-countdowns')
    if (!saved) return

    const parsed = JSON.parse(saved)
    const countdowns = Array.isArray(parsed) ? parsed : (parsed.countdowns || [])

    // Filter out countdowns with invalid dates
    const validCountdowns = countdowns.filter((countdown: any) => {
      if (!countdown.date) return false
      const date = new Date(countdown.date)
      return !isNaN(date.getTime())
    })

    if (validCountdowns.length !== countdowns.length) {
      console.log(`🧹 Cleaned ${countdowns.length - validCountdowns.length} invalid countdowns`)
      localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: validCountdowns }))
    }
  } catch (error) {
    console.error('❌ Error validating countdown data:', error)
  }
}

// Function to inspect current localStorage data
export function inspectLocalStorageData(): void {
  if (typeof window === 'undefined') return

  const countdowns = localStorage.getItem('disney-countdowns')
  const currentCountdown = localStorage.getItem('disney-current-countdown')
  const widgetConfigs = localStorage.getItem('disney-widget-configs')

  // Show detailed countdowns info
  if (countdowns) {
    const parsed = JSON.parse(countdowns)
    const countdownsArray = Array.isArray(parsed) ? parsed : (parsed.countdowns || [])
    console.log('📊 Countdowns details:', countdownsArray.map((c: any) => ({
      id: c.id,
      name: c.name,
      date: c.date,
      tripDate: c.tripDate,
      park: c.park?.name
    })))
  }
}