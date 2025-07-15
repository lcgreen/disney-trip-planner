// Disney Trip Planner Configuration Types
// This file defines all TypeScript interfaces for configuration data

// Parks Configuration
export interface DisneyPark {
  id: string
  name: string
  location: string
  color: string
  gradient: string
  timezone: string
  openingTime: string
  icon: string
  description: string
  popularAttractions: string[]
}

export interface ParksConfig {
  parks: DisneyPark[]
}

// Themes Configuration
export interface CountdownTheme {
  id: string
  name: string
  gradient: string
  textColor: string
  digitBg: string
  description: string
}

export interface QuickDateOption {
  label: string
  description: string
  days?: number
  daysFunction?: string
}

export interface ThemesConfig {
  themes: CountdownTheme[]
  quickDateOptions: QuickDateOption[]
}

// Budget Configuration
export interface BudgetCategory {
  id: string
  name: string
  budget: number
  color: string
  icon: string
  description: string
  tips: string[]
}

export interface BudgetSettings {
  defaultCurrency: string
  currencyOptions: string[]
  defaultCategories: string[]
  suggestedBudgets: {
    [key: string]: {
      [categoryId: string]: number
    }
  }
}

export interface BudgetTips {
  general: string[]
  saving: string[]
}

export interface BudgetConfig {
  categories: BudgetCategory[]
  budgetSettings: BudgetSettings
  tips: BudgetTips
}

// Packing Configuration
export interface PackingCategory {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export interface PackingItem {
  name: string
  category: string
  isEssential: boolean
  weatherDependent?: string[]
  description?: string
}

export interface PackingTips {
  general: string[]
  disney: string[]
  weather: string[]
}

export interface PackingConfig {
  categories: PackingCategory[]
  defaultItems: PackingItem[]
  tips: PackingTips
}

// Activity Types Configuration
export interface ActivityType {
  value: string
  label: string
  color: string
  icon: string
  description: string
  tips: string[]
}

export interface Priority {
  value: 'high' | 'medium' | 'low'
  label: string
  color: string
  badgeVariant: string
  description: string
  icon: string
}

export interface ActivityTips {
  planning: string[]
  scheduling: string[]
  efficiency: string[]
}

export interface ActivityTypesConfig {
  activityTypes: ActivityType[]
  priorities: Priority[]
  defaultTimeSlots: string[]
  tips: ActivityTips
}

// Weather Configuration
export interface WeatherCondition {
  id: string
  name: string
  icon: string
  description: string
  temperature: string
  recommendations: string[]
}

export interface SeasonalGuide {
  months: string[]
  typicalWeather: string[]
  averageTemp: string
  packingTips: string[]
}

export interface LocationInfo {
  climate: string
  notes: string[]
  specialConsiderations: string[]
}

export interface WeatherTips {
  general: string[]
  packing: string[]
}

export interface WeatherConfig {
  weatherConditions: WeatherCondition[]
  seasonalGuides: {
    spring: SeasonalGuide
    summer: SeasonalGuide
    fall: SeasonalGuide
    winter: SeasonalGuide
  }
  locationSpecific: {
    florida: LocationInfo
    california: LocationInfo
    international: LocationInfo
  }
  tips: WeatherTips
}

// Combined configuration type for type safety
export interface AppConfig {
  parks: ParksConfig
  themes: ThemesConfig
  budget: BudgetConfig
  packing: PackingConfig
  activityTypes: ActivityTypesConfig
  weather: WeatherConfig
}

// Select option interface for UI components
export interface SelectOption {
  value: string
  label: string
  icon?: string
  description?: string
  disabled?: boolean
}