import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HelpCircle, Info, Star, Crown, Wand2 } from 'lucide-react'
import {
  Tooltip,
  TooltipProvider,
  DisneyTooltip,
  PremiumTooltip,
  HelpTooltip,
  FeatureTooltip
} from './Tooltip'
import { Button } from './Button'
import { Badge } from './Badge'

const meta: Meta<typeof Tooltip> = {
  title: 'Disney UI/Tooltip',
  component: Tooltip,
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
    docs: {
      description: {
        component: 'A magical tooltip component built with Radix UI primitives. Provides accessible hover and focus states with beautiful Disney theming and animations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'disney', 'premium', 'success', 'warning', 'error', 'light'],
      description: 'Visual style variant of the tooltip',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the tooltip',
    },
    side: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Side where the tooltip appears',
    },
    delayDuration: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: 'Delay before tooltip appears (ms)',
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="p-20">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Basic Tooltip Example
export const BasicTooltip: Story = {
  render: (args) => (
    <Tooltip
      content="This is a helpful tooltip with information about this feature."
      {...args}
    >
      <Button variant="disney">
        Hover for Info
      </Button>
    </Tooltip>
  ),
}

// Disney Themed Tooltips
export const DisneyVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Tooltip variant="disney" content="✨ Magical Disney experience awaits!">
        <Button variant="disney" icon={<Star />}>
          Disney Magic
        </Button>
      </Tooltip>

      <Tooltip variant="premium" content="🏰 Premium features for the ultimate trip">
        <Button variant="premium" icon={<Crown />}>
          Premium Experience
        </Button>
      </Tooltip>

      <Tooltip variant="success" content="✅ Your trip planning is on track!">
        <Button variant="animalKingdom">
          Trip Status
        </Button>
      </Tooltip>

      <Tooltip variant="warning" content="⚠️ Don't forget to book your FastPass+">
        <Button variant="hollywoodStudios">
          FastPass Reminder
        </Button>
      </Tooltip>

      <Tooltip variant="error" content="❌ This feature requires park tickets">
        <Button variant="secondary">
          Requires Tickets
        </Button>
      </Tooltip>
    </div>
  ),
}

// Tooltip Sizes
export const TooltipSizes: Story = {
  render: () => (
    <div className="flex gap-6 items-center">
      <Tooltip
        variant="disney"
        size="sm"
        content="Small tooltip with compact text"
      >
        <Button size="sm">Small</Button>
      </Tooltip>

      <Tooltip
        variant="disney"
        size="md"
        content="Medium tooltip with standard text size"
      >
        <Button size="md">Medium</Button>
      </Tooltip>

      <Tooltip
        variant="disney"
        size="lg"
        content="Large tooltip with bigger text for emphasis"
      >
        <Button size="lg">Large</Button>
      </Tooltip>
    </div>
  ),
}

// Tooltip Positions
export const TooltipPositions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 place-items-center">
      <div></div>
      <Tooltip
        variant="disney"
        side="top"
        content="Tooltip appears above"
      >
        <Button variant="magicKingdom">Top</Button>
      </Tooltip>
      <div></div>

            <Tooltip
        variant="premium"
        side="left"
        content="Tooltip appears to the left"
      >
        <Button variant="epcot">Left</Button>
      </Tooltip>

      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        Center Reference
      </div>

      <Tooltip
        variant="success"
        side="right"
        content="Tooltip appears to the right"
      >
        <Button variant="animalKingdom">Right</Button>
      </Tooltip>

      <div></div>
      <Tooltip
        variant="error"
        side="bottom"
        content="Tooltip appears below"
      >
        <Button variant="hollywoodStudios">Bottom</Button>
      </Tooltip>
      <div></div>
    </div>
  ),
}

// Specialized Tooltip Components
export const SpecializedTooltips: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <h3 className="text-lg font-semibold text-gray-800">Disney Feature Tooltips:</h3>

        <FeatureTooltip content="Access exclusive character meet & greets">
          <Badge variant="premium" icon={<Crown />}>
            Premium Feature
          </Badge>
        </FeatureTooltip>

        <DisneyTooltip content="Track your magical moments and memories">
          <Badge variant="disney" icon={<Star />}>
            Magic Tracker
          </Badge>
        </DisneyTooltip>

        <PremiumTooltip content="VIP access to all Disney parks worldwide">
          <Badge variant="premium" icon={<Wand2 />}>
            VIP Access
          </Badge>
        </PremiumTooltip>
      </div>

      <div className="flex gap-4 items-center">
        <h3 className="text-lg font-semibold text-gray-800">Help Tooltips:</h3>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Trip Budget</span>
          <HelpTooltip content="Set a budget to track your Disney trip expenses">
            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
          </HelpTooltip>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Park Hopper</span>
          <HelpTooltip content="Visit multiple Disney parks in the same day">
            <Info className="h-4 w-4 text-gray-400 cursor-help" />
          </HelpTooltip>
        </div>
      </div>
    </div>
  ),
}

// Rich Content Tooltips
export const RichContentTooltips: Story = {
  render: () => (
    <div className="flex gap-6 items-center">
      <Tooltip
        variant="disney"
        size="lg"
        content={
          <div className="max-w-xs">
            <div className="font-bold mb-2 flex items-center gap-2">
              🏰 Magic Kingdom
            </div>
            <div className="text-sm space-y-1">
              <div>• 25+ magical attractions</div>
              <div>• Classic Disney characters</div>
              <div>• Fireworks spectacular</div>
              <div>• Main Street USA</div>
            </div>
            <div className="text-xs mt-2 opacity-75">
              The most magical place on earth! ✨
            </div>
          </div>
        }
      >
        <Button variant="magicKingdom" size="lg">
          Magic Kingdom Info
        </Button>
      </Tooltip>

      <Tooltip
        variant="premium"
        size="lg"
        content={
          <div className="max-w-sm">
            <div className="font-bold mb-2 flex items-center gap-2">
              👑 Premium Trip Package
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Park Hopper Plus</span>
                <span className="font-semibold">$549</span>
              </div>
              <div className="flex justify-between">
                <span>Genie+ Service</span>
                <span className="font-semibold">$99</span>
              </div>
              <div className="flex justify-between">
                <span>Character Dining</span>
                <span className="font-semibold">$199</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-bold">
                <span>Total:</span>
                <span>$847</span>
              </div>
            </div>
          </div>
        }
      >
        <Button variant="premium" size="lg">
          Package Details
        </Button>
      </Tooltip>
    </div>
  ),
}

// Interactive Example
export const InteractiveExample: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Disney Trip Planner Dashboard</h3>
        <p className="text-gray-600 mb-6">Hover over elements to see helpful tooltips</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Trip to Walt Disney World</h4>
            <HelpTooltip content="Your complete Disney vacation planning dashboard">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </HelpTooltip>
          </div>

          <FeatureTooltip content="Upgrade to premium for advanced planning tools">
            <Badge variant="premium">Premium Available</Badge>
          </FeatureTooltip>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DisneyTooltip content="Days until your magical Disney adventure begins!">
            <div className="bg-gradient-to-r from-disney-blue to-disney-purple rounded-lg p-4 text-white text-center cursor-pointer">
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm">Days Left</div>
            </div>
          </DisneyTooltip>

          <Tooltip variant="success" content="You're within budget for your Disney trip!">
            <div className="bg-green-100 rounded-lg p-4 text-center cursor-pointer">
              <div className="text-2xl font-bold text-green-800">$2,847</div>
              <div className="text-sm text-green-600">Budget Used</div>
            </div>
          </Tooltip>

          <Tooltip variant="warning" content="Don't forget to book your dining reservations!">
            <div className="bg-yellow-100 rounded-lg p-4 text-center cursor-pointer">
              <div className="text-2xl font-bold text-yellow-800">3</div>
              <div className="text-sm text-yellow-600">Dining Booked</div>
            </div>
          </Tooltip>

          <PremiumTooltip content="FastPass+ selections for shorter wait times">
            <div className="bg-gradient-to-r from-disney-gold to-disney-orange rounded-lg p-4 text-center cursor-pointer">
              <div className="text-2xl font-bold text-disney-blue">12</div>
              <div className="text-sm text-disney-blue">FastPasses</div>
            </div>
          </PremiumTooltip>
        </div>
      </div>
    </div>
  ),
}