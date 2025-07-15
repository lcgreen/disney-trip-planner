// Disney Trip Planner Configuration Loader
// Centralized configuration management with type safety

import parksConfig from './parks.json'
import themesConfig from './themes.json'
import budgetConfig from './budget-categories.json'
import packingConfig from './packing-categories.json'
import activityTypesConfig from './activity-types.json'
import weatherConfig from './weather.json'

import type {
  ParksConfig,
  ThemesConfig,
  BudgetConfig,
  PackingConfig,
  ActivityTypesConfig,
  WeatherConfig,
  DisneyPark,
  CountdownTheme,
  BudgetCategory,
  PackingCategory,
  PackingItem,
  ActivityType,
  Priority,
  WeatherCondition,
  SelectOption
} from './types'

// Type-safe configuration loaders
export const getParksConfig = (): ParksConfig => parksConfig as ParksConfig
export const getThemesConfig = (): ThemesConfig => themesConfig as ThemesConfig
export const getBudgetConfig = (): BudgetConfig => budgetConfig as BudgetConfig
export const getPackingConfig = (): PackingConfig => packingConfig as PackingConfig
export const getActivityTypesConfig = (): ActivityTypesConfig => activityTypesConfig as ActivityTypesConfig
export const getWeatherConfig = (): WeatherConfig => weatherConfig as WeatherConfig

// Convenience functions for commonly used data

// Parks
export const getAllParks = (): DisneyPark[] => getParksConfig().parks
export const getParkById = (id: string): DisneyPark | undefined =>
  getAllParks().find(park => park.id === id)
export const getParkOptions = (): SelectOption[] =>
  getAllParks().map(park => ({
    value: park.id,
    label: park.name,
    icon: park.icon,
    description: park.location
  }))

// Themes
export const getAllThemes = (): CountdownTheme[] => getThemesConfig().themes
export const getThemeById = (id: string): CountdownTheme | undefined =>
  getAllThemes().find(theme => theme.id === id)
export const getQuickDateOptions = () => getThemesConfig().quickDateOptions

// Budget Categories
export const getAllBudgetCategories = (): BudgetCategory[] => getBudgetConfig().categories
export const getBudgetCategoryById = (id: string): BudgetCategory | undefined =>
  getAllBudgetCategories().find(category => category.id === id)
export const getBudgetCategoryOptions = (): SelectOption[] =>
  getAllBudgetCategories().map(category => ({
    value: category.id,
    label: category.name,
    icon: category.icon,
    description: category.description
  }))
export const getBudgetSettings = () => getBudgetConfig().budgetSettings
export const getBudgetTips = () => getBudgetConfig().tips

// Packing
export const getAllPackingCategories = (): PackingCategory[] => getPackingConfig().categories
export const getPackingCategoryById = (id: string): PackingCategory | undefined =>
  getAllPackingCategories().find(category => category.id === id)
export const getPackingCategoryOptions = (): SelectOption[] => [
  { value: 'all', label: 'All Categories' },
  ...getAllPackingCategories().map(category => ({
    value: category.id,
    label: `${category.icon} ${category.name}`,
    description: category.description
  }))
]
export const getDefaultPackingItems = (): PackingItem[] => getPackingConfig().defaultItems
export const getPackingTips = () => getPackingConfig().tips

// Activity Types
export const getAllActivityTypes = (): ActivityType[] => getActivityTypesConfig().activityTypes
export const getActivityTypeById = (id: string): ActivityType | undefined =>
  getAllActivityTypes().find(type => type.value === id)
export const getActivityTypeOptions = (): SelectOption[] =>
  getAllActivityTypes().map(type => ({
    value: type.value,
    label: type.label,
    icon: type.icon,
    description: type.description
  }))
export const getAllPriorities = (): Priority[] => getActivityTypesConfig().priorities
export const getPriorityById = (id: string): Priority | undefined =>
  getAllPriorities().find(priority => priority.value === id)
export const getPriorityOptions = (): SelectOption[] =>
  getAllPriorities().map(priority => ({
    value: priority.value,
    label: priority.label,
    icon: priority.icon,
    description: priority.description
  }))
export const getDefaultTimeSlots = (): string[] => getActivityTypesConfig().defaultTimeSlots
export const getActivityTips = () => getActivityTypesConfig().tips

// Weather
export const getAllWeatherConditions = (): WeatherCondition[] => getWeatherConfig().weatherConditions
export const getWeatherConditionById = (id: string): WeatherCondition | undefined =>
  getAllWeatherConditions().find(condition => condition.id === id)
export const getSeasonalGuides = () => getWeatherConfig().seasonalGuides
export const getLocationInfo = () => getWeatherConfig().locationSpecific
export const getWeatherTips = () => getWeatherConfig().tips

// Helper functions for date calculations
export const calculateQuickDate = (option: { days?: number; daysFunction?: string }): Date => {
  const now = new Date()

  if (option.days) {
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() + option.days)
    return targetDate
  }

  if (option.daysFunction === 'getNextFriday') {
    const friday = new Date(now)
    friday.setDate(now.getDate() + (5 - now.getDay() + 7) % 7)
    return friday
  }

  return now
}

// Validation helpers
export const isValidParkId = (id: string): boolean =>
  getAllParks().some(park => park.id === id)

export const isValidThemeId = (id: string): boolean =>
  getAllThemes().some(theme => theme.id === id)

export const isValidBudgetCategoryId = (id: string): boolean =>
  getAllBudgetCategories().some(category => category.id === id)

export const isValidPackingCategoryId = (id: string): boolean =>
  getAllPackingCategories().some(category => category.id === id)

export const isValidActivityType = (type: string): boolean =>
  getAllActivityTypes().some(activityType => activityType.value === type)

export const isValidPriority = (priority: string): boolean =>
  getAllPriorities().some(p => p.value === priority)

export const isValidWeatherCondition = (condition: string): boolean =>
  getAllWeatherConditions().some(weather => weather.id === condition)

// Export all types for external use
export type {
  ParksConfig,
  ThemesConfig,
  BudgetConfig,
  PackingConfig,
  ActivityTypesConfig,
  WeatherConfig,
  DisneyPark,
  CountdownTheme,
  BudgetCategory,
  PackingCategory,
  PackingItem,
  ActivityType,
  Priority,
  WeatherCondition,
  SelectOption
} from './types'

// Default export with all configurations
export default {
  parks: getParksConfig(),
  themes: getThemesConfig(),
  budget: getBudgetConfig(),
  packing: getPackingConfig(),
  activityTypes: getActivityTypesConfig(),
  weather: getWeatherConfig()
}