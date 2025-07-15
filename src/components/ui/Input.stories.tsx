import type { Meta, StoryObj } from '@storybook/react'
import { User, Mail, Lock, Search, Calendar, MapPin } from 'lucide-react'
import { Input } from './Input'

const meta = {
  title: 'Disney UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A magical input component with Disney theming, icons, and validation states. Perfect for forms throughout the Disney Trip Planner.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success', 'disney'],
      description: 'Visual style variant of the input',
    },
    inputSize: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date', 'datetime-local'],
      description: 'HTML input type',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the input when true',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    placeholder: 'Enter your Disney destination...',
  },
}

// With label
export const WithLabel: Story = {
  args: {
    label: 'Trip Destination',
    placeholder: 'Where are you going?',
  },
}

// Variants
export const DefaultVariant: Story = {
  args: {
    variant: 'default',
    label: 'Default Input',
    placeholder: 'Default styling',
  },
}

export const DisneyVariant: Story = {
  args: {
    variant: 'disney',
    label: 'Disney Themed',
    placeholder: 'Disney magic!',
  },
}

export const ErrorState: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'your@email.com',
    error: 'Please enter a valid email address',
    value: 'invalid-email',
  },
}

export const SuccessState: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'your@email.com',
    success: 'Email address is valid!',
    value: 'user@example.com',
  },
}

// Sizes
export const Small: Story = {
  args: {
    inputSize: 'sm',
    label: 'Small Input',
    placeholder: 'Small size',
  },
}

export const Medium: Story = {
  args: {
    inputSize: 'md',
    label: 'Medium Input',
    placeholder: 'Medium size (default)',
  },
}

export const Large: Story = {
  args: {
    inputSize: 'lg',
    label: 'Large Input',
    placeholder: 'Large size',
  },
}

// With icons
export const WithLeftIcon: Story = {
  args: {
    label: 'Search Disney Parks',
    placeholder: 'Search for attractions, restaurants...',
    leftIcon: <Search className="w-4 h-4" />,
  },
}

export const WithRightIcon: Story = {
  args: {
    label: 'Location',
    placeholder: 'Select park location',
    rightIcon: <MapPin className="w-4 h-4" />,
  },
}

export const EmailWithIcon: Story = {
  args: {
    type: 'email',
    label: 'Email Address',
    placeholder: 'your@email.com',
    leftIcon: <Mail className="w-4 h-4" />,
  },
}

export const PasswordWithIcon: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    leftIcon: <Lock className="w-4 h-4" />,
  },
}

// Input types
export const EmailInput: Story = {
  args: {
    type: 'email',
    label: 'Email Address',
    placeholder: 'your@email.com',
    helperText: 'We\'ll use this for your trip confirmations',
  },
}

export const PasswordInput: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Create a secure password',
    helperText: 'Must be at least 8 characters',
  },
}

export const DateInput: Story = {
  args: {
    type: 'date',
    label: 'Trip Date',
    helperText: 'Select your Disney trip date',
  },
}

export const DateTimeInput: Story = {
  args: {
    type: 'datetime-local',
    label: 'Departure Time',
    helperText: 'When do you plan to arrive at the park?',
  },
}

export const NumberInput: Story = {
  args: {
    type: 'number',
    label: 'Number of Guests',
    placeholder: '2',
    helperText: 'How many people in your group?',
    min: 1,
    max: 10,
  },
}

// States
export const WithHelperText: Story = {
  args: {
    label: 'Disney Resort',
    placeholder: 'Select your resort',
    helperText: 'Choose the Disney resort you\'re staying at',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This field is disabled',
    disabled: true,
    helperText: 'This field cannot be edited',
  },
}

// Form examples
export const TripPlanningForm: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan Your Disney Trip</h3>

      <Input
        label="Your Name"
        placeholder="Enter your full name"
        leftIcon={<User className="w-4 h-4" />}
      />

      <Input
        type="email"
        label="Email Address"
        placeholder="your@email.com"
        leftIcon={<Mail className="w-4 h-4" />}
        helperText="For trip confirmations and updates"
      />

      <Input
        type="date"
        label="Trip Start Date"
        leftIcon={<Calendar className="w-4 h-4" />}
      />

      <Input
        label="Preferred Disney Park"
        placeholder="Magic Kingdom, EPCOT, etc."
        leftIcon={<MapPin className="w-4 h-4" />}
        variant="disney"
      />

      <Input
        type="number"
        label="Number of Guests"
        placeholder="2"
        min={1}
        max={10}
        helperText="Including adults and children"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// Showcase all variants
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Variants</h3>
        <Input variant="default" placeholder="Default variant" />
        <Input variant="disney" placeholder="Disney variant" />
        <Input variant="error" placeholder="Error state" error="This field has an error" />
        <Input variant="success" placeholder="Success state" success="This field is valid!" />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Sizes</h3>
        <Input inputSize="sm" placeholder="Small input" />
        <Input inputSize="md" placeholder="Medium input (default)" />
        <Input inputSize="lg" placeholder="Large input" />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">With Icons</h3>
        <Input placeholder="Left icon" leftIcon={<Search className="w-4 h-4" />} />
        <Input placeholder="Right icon" rightIcon={<MapPin className="w-4 h-4" />} />
        <Input placeholder="Both icons" leftIcon={<User className="w-4 h-4" />} rightIcon={<Calendar className="w-4 h-4" />} />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}