import { motion } from 'framer-motion'
import { SettingsPanel as UISettingsPanel, SettingToggle, Select } from '@/components/ui'
import { getAllThemes } from '@/config'

interface SettingsPanelProps {
  showSettings: boolean
  settings: any
  customTheme: any
  onSettingChange: (key: string, value: any) => void
  onThemeChange: (theme: any) => void
}

const SettingsPanel = ({
  showSettings,
  settings,
  customTheme,
  onSettingChange,
  onThemeChange
}: SettingsPanelProps) => {
  const customThemes = getAllThemes()

  if (!showSettings) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <UISettingsPanel
        title="Customisation Options"
        defaultExpanded={true}
        data-testid="settings-panel"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Theme</h4>
            <div className="space-y-3">
              {customThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    customTheme?.id === theme.id
                      ? 'ring-2 ring-disney-blue shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.gradient.split(' ')[1]} 0%, ${theme.gradient.split(' ')[3]} 100%)`
                  }}
                >
                  <span className="text-gray-800 font-medium">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Display Options</h4>
            <div className="space-y-4">
              <SettingToggle
                setting="Show milliseconds"
                checked={settings.showMilliseconds}
                onChange={(checked: boolean) => onSettingChange('showMilliseconds', checked)}
                data-testid="setting-show-milliseconds"
              />
              <SettingToggle
                setting="Show timezone"
                checked={settings.showTimezone}
                onChange={(checked: boolean) => onSettingChange('showTimezone', checked)}
                data-testid="setting-show-timezone"
              />
              <SettingToggle
                setting="Show planning tips"
                checked={settings.showTips}
                onChange={(checked: boolean) => onSettingChange('showTips', checked)}
                data-testid="setting-show-tips"
              />
              <SettingToggle
                setting="Show attractions"
                checked={settings.showAttractions}
                onChange={(checked: boolean) => onSettingChange('showAttractions', checked)}
                data-testid="setting-show-attractions"
              />
              <SettingToggle
                setting="Play completion sound"
                checked={settings.playSound}
                onChange={(checked: boolean) => onSettingChange('playSound', checked)}
                data-testid="setting-play-sound"
              />
              <SettingToggle
                setting="Auto refresh"
                checked={settings.autoRefresh}
                onChange={(checked: boolean) => onSettingChange('autoRefresh', checked)}
                data-testid="setting-auto-refresh"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Style Options</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Digit Style</label>
                <Select
                  value={settings.digitStyle}
                  onValueChange={(value: string) => onSettingChange('digitStyle', value)}
                  options={[
                    { value: 'modern', label: 'Modern' },
                    { value: 'classic', label: 'Classic' },
                    { value: 'neon', label: 'Neon' },
                    { value: 'minimal', label: 'Minimal' }
                  ]}
                  dataTestId="setting-digit-style"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                <Select
                  value={settings.layout}
                  onValueChange={(value: string) => onSettingChange('layout', value)}
                  options={[
                    { value: 'horizontal', label: 'Horizontal' },
                    { value: 'vertical', label: 'Vertical' },
                    { value: 'compact', label: 'Compact' },
                    { value: 'grid', label: 'Grid' }
                  ]}
                  dataTestId="setting-layout"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value: string) => onSettingChange('fontSize', value)}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                    { value: 'xl', label: 'Extra Large' }
                  ]}
                  dataTestId="setting-font-size"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Effect</label>
                <Select
                  value={settings.backgroundEffect}
                  onValueChange={(value: string) => onSettingChange('backgroundEffect', value)}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'particles', label: 'Particles' },
                    { value: 'gradient', label: 'Gradient' },
                    { value: 'animated', label: 'Animated' }
                  ]}
                  dataTestId="setting-background-effect"
                />
              </div>
            </div>
          </div>
        </div>
      </UISettingsPanel>
    </motion.div>
  )
}

export default SettingsPanel