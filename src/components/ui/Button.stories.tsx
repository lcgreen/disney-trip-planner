import type { Meta, StoryObj } from '@storybook/react'
import { Star, Download, Calendar, MapPin } from 'lucide-react'
import { Button } from './Button'

const meta = {
  title: 'Disney UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A magical button component with Disney-themed variants and sizes. Perfect for creating enchanting user interfaces throughout the Disney Trip Planner.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'disney',
        'premium',
        'secondary',
        'outline',
        'ghost',
        'link',
        'magicKingdom',
        'epcot',
        'hollywoodStudios',
        'animalKingdom',
        'disneyland',
      ],
      description: 'Visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the button',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Whether the button should take full width',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows loading spinner when true',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the button when true',
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Position of the icon relative to text',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    children: 'Plan Your Disney Trip',
  },
}

// Variant showcase
export const Disney: Story = {
  args: {
    variant: 'disney',
    children: 'Disney Magic',
  },
}

export const Premium: Story = {
  args: {
    variant: 'premium',
    children: 'Upgrade to Premium',
    icon: <Star className="w-4 h-4" />,
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Action',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
}

// Park-themed variants
export const MagicKingdom: Story = {
  args: {
    variant: 'magicKingdom',
    children: 'Magic Kingdom',
    icon: <Star className="w-4 h-4" />,
  },
}

export const EPCOT: Story = {
  args: {
    variant: 'epcot',
    children: 'EPCOT',
    icon: <MapPin className="w-4 h-4" />,
  },
}

export const HollywoodStudios: Story = {
  args: {
    variant: 'hollywoodStudios',
    children: 'Hollywood Studios',
  },
}

export const AnimalKingdom: Story = {
  args: {
    variant: 'animalKingdom',
    children: 'Animal Kingdom',
  },
}

export const Disneyland: Story = {
  args: {
    variant: 'disneyland',
    children: 'Disneyland',
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
}

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    children: 'Extra Large Button',
  },
}

// With icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Download Itinerary',
    icon: <Download className="w-4 h-4" />,
    iconPosition: 'left',
  },
}

export const WithRightIcon: Story = {
  args: {
    children: 'Book Now',
    icon: <Calendar className="w-4 h-4" />,
    iconPosition: 'right',
  },
}

// States
export const Loading: Story = {
  args: {
    children: 'Booking Your Trip...',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Unavailable',
    disabled: true,
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
}

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">Primary Variants</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="disney">Disney</Button>
          <Button variant="premium">Premium</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">Park Themes</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="magicKingdom">Magic Kingdom</Button>
          <Button variant="epcot">EPCOT</Button>
          <Button variant="hollywoodStudios">Hollywood Studios</Button>
          <Button variant="animalKingdom">Animal Kingdom</Button>
          <Button variant="disneyland">Disneyland</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">Sizes</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}