// Centralized type definitions to eliminate duplications

// Base plugin data interface
export interface PluginData {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  [key: string]: any // Allow plugins to store their own data
}

// Countdown types
export interface CountdownData extends PluginData {
  tripDate: string
  park?: any
  settings?: CountdownSettings
  theme?: any
}

export interface CountdownSettings {
  showMilliseconds: boolean
  showTimezone: boolean
  showTips: boolean
  showAttractions: boolean
  playSound: boolean
  autoRefresh: boolean
  digitStyle: 'modern' | 'classic' | 'neon' | 'minimal'
  layout: 'horizontal' | 'vertical' | 'compact' | 'grid'
  fontSize: 'small' | 'medium' | 'large' | 'xl'
  backgroundEffect: 'none' | 'particles' | 'gradient' | 'animated'
}

// Budget types
export interface BudgetData extends PluginData {
  totalBudget: number
  categories: BudgetCategory[]
  expenses: Expense[]
}

export interface BudgetCategory {
  id: string
  name: string
  budget: number
  color: string
  icon: string
}

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  isEstimate: boolean
}

// Packing types
export interface PackingData extends PluginData {
  items: PackingItem[]
  selectedWeather: string[]
}

export interface PackingItem {
  id: string
  name: string
  checked: boolean
  category: string
}

// Planner types
export interface PlannerData extends PluginData {
  days: PlannerDay[]
}

export interface PlannerDay {
  id: string
  date: string
  plans: PlannerPlan[]
}

export interface PlannerPlan {
  id: string
  date: string
  time: string
  activity: string
  park: string
}

// Widget types
export type WidgetSize = 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'full'

export interface WidgetConfig {
  id: string
  type: 'countdown' | 'planner' | 'budget' | 'packing'
  size: WidgetSize
  order: number
  width?: string
  selectedItemId?: string
  settings: Record<string, any>
}

// Legacy type aliases for backward compatibility
export type SavedCountdown = CountdownData
export type SavedBudget = BudgetData
export type SavedPackingList = PackingData
export type SavedTripPlan = PlannerData