import type { Meta, StoryObj } from '@storybook/react'
import { Crown, Star, Calendar, MapPin } from 'lucide-react'
import {
  Badge,
  PremiumBadge,
  EssentialBadge,
  WeatherBadge,
  StatusBadge,
  ParkBadge,
  CountBadge,
  CategoryBadge
} from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'disney-gradient', value: 'linear-gradient(135deg, #003087 0%, #FFD700 100%)' },
        { name: 'dark', value: '#1e293b' },
      ],
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'premium', 'disney', 'essential', 'weather', 'park', 'status', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
    },
    interactive: {
      control: { type: 'boolean' },
    },
    removable: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Default Badge',
    variant: 'default',
    size: 'sm',
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="premium">Premium</Badge>
      <Badge variant="disney">Disney</Badge>
      <Badge variant="essential">Essential</Badge>
      <Badge variant="weather">Weather</Badge>
      <Badge variant="park">Park</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Badge variant="disney" size="xs">Extra Small</Badge>
      <Badge variant="disney" size="sm">Small</Badge>
      <Badge variant="disney" size="md">Medium</Badge>
      <Badge variant="disney" size="lg">Large</Badge>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="premium" icon={<Crown className="w-3 h-3" />}>
        Premium
      </Badge>
      <Badge variant="disney" icon={<Star className="w-3 h-3" />}>
        Favourite
      </Badge>
      <Badge variant="info" icon={<Calendar className="w-3 h-3" />}>
        Scheduled
      </Badge>
      <Badge variant="park" icon={<MapPin className="w-3 h-3" />}>
        Magic Kingdom
      </Badge>
    </div>
  ),
}

export const Interactive: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="disney" interactive onClick={() => alert('Badge clicked!')}>
        Clickable Badge
      </Badge>
      <Badge variant="success" interactive onClick={() => alert('Task clicked!')}>
        Complete Task
      </Badge>
      <Badge variant="outline" interactive onClick={() => alert('Filter clicked!')}>
        Apply Filter
      </Badge>
    </div>
  ),
}

export const Removable: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default" removable onRemove={() => alert('Tag removed!')}>
        Removable Tag
      </Badge>
      <Badge variant="disney" removable onRemove={() => alert('Filter removed!')}>
        Active Filter
      </Badge>
      <Badge variant="success" removable onRemove={() => alert('Category removed!')}>
        Selected Category
      </Badge>
    </div>
  ),
}

// Specialized component stories
export const PremiumBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm">Trip Planner</span>
        <PremiumBadge />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Budget Tracker</span>
        <PremiumBadge />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Advanced Features</span>
        <PremiumBadge />
      </div>
    </div>
  ),
}

export const EssentialBadges: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">Park Tickets</span>
        <EssentialBadge />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Passport/ID</span>
        <EssentialBadge />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Phone Charger</span>
        <EssentialBadge />
      </div>
    </div>
  ),
}

export const WeatherBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <WeatherBadge weather="Sunny" icon="☀️" active />
      <WeatherBadge weather="Hot (>25°C)" icon="🌡️" />
      <WeatherBadge weather="Cold (<15°C)" icon="❄️" />
      <WeatherBadge weather="Rainy" icon="🌧️" />
    </div>
  ),
}

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="pending" />
      <StatusBadge status="in-progress" />
      <StatusBadge status="completed" />
      <StatusBadge status="cancelled" />
      <StatusBadge status="overdue" />
    </div>
  ),
}

export const ParkBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ParkBadge park="Magic Kingdom" />
      <ParkBadge park="EPCOT" />
      <ParkBadge park="Hollywood Studios" />
      <ParkBadge park="Animal Kingdom" />
      <ParkBadge park="Disneyland" />
    </div>
  ),
}

export const CountBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm">Saved Countdowns</span>
        <CountBadge count={3} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Tasks Completed</span>
        <CountBadge count={7} max={10} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">All Done!</span>
        <CountBadge count={5} max={5} />
      </div>
    </div>
  ),
}

export const CategoryBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <CategoryBadge category="Accommodation" color="blue" />
      <CategoryBadge category="Dining" color="green" />
      <CategoryBadge category="Transport" color="purple" />
      <CategoryBadge category="Shopping" color="yellow" />
      <CategoryBadge category="Entertainment" color="pink" removable onRemove={() => alert('Category removed!')} />
    </div>
  ),
}

export const RealWorldExample: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border max-w-md">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Disney Trip Planner
          <PremiumBadge />
        </h3>
        <p className="text-gray-600 text-sm">Plan your magical Disney adventure with premium features</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Packing Items</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Park Tickets</span>
            <div className="flex gap-2">
              <EssentialBadge />
              <StatusBadge status="completed" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Rain Jacket</span>
            <div className="flex gap-2">
              <WeatherBadge weather="Rainy" icon="🌧️" />
              <StatusBadge status="pending" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Selected Parks</h4>
        <div className="flex flex-wrap gap-2">
          <ParkBadge park="Magic Kingdom" />
          <ParkBadge park="EPCOT" />
          <Badge variant="outline" removable onRemove={() => alert('Removed!')}>
            Hollywood Studios
          </Badge>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Progress</h4>
        <div className="flex items-center gap-2">
          <span className="text-sm">Trip Planning</span>
          <CountBadge count={8} max={10} />
          <StatusBadge status="in-progress" />
        </div>
      </div>
    </div>
  ),
}