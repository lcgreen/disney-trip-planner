// Plugin loader - imports all plugins to ensure they're registered
import './countdown'
import './planner'
import './budget'
import './packing'

// Re-export the plugin system for easy access
export * from '@/lib/pluginSystem'