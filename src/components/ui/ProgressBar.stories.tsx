import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar, BudgetProgress, PackingProgress, TaskProgress } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
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
      options: ['default', 'success', 'warning', 'error', 'disney', 'premium', 'park'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    max: {
      control: { type: 'number' },
    },
    showPercentage: {
      control: { type: 'boolean' },
    },
    showValues: {
      control: { type: 'boolean' },
    },
    animated: {
      control: { type: 'boolean' },
    },
    striped: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 65,
    max: 100,
    variant: 'default',
    size: 'md',
    showPercentage: false,
    showValues: false,
    animated: false,
    striped: false,
  },
}

export const WithLabel: Story = {
  args: {
    value: 75,
    max: 100,
    variant: 'disney',
    size: 'md',
    label: 'Trip Planning Progress',
    description: 'Almost ready for your magical adventure!',
    showPercentage: true,
  },
}

export const Disney: Story = {
  args: {
    value: 80,
    max: 100,
    variant: 'disney',
    size: 'lg',
    label: 'Disney Magic Level',
    showPercentage: true,
    animated: true,
  },
}

export const Premium: Story = {
  args: {
    value: 45,
    max: 100,
    variant: 'premium',
    size: 'lg',
    label: 'Premium Features Unlocked',
    showPercentage: true,
  },
}

export const Success: Story = {
  args: {
    value: 100,
    max: 100,
    variant: 'success',
    size: 'md',
    label: 'Task Completed',
    description: 'All items have been completed successfully!',
    showPercentage: true,
  },
}

export const Warning: Story = {
  args: {
    value: 90,
    max: 100,
    variant: 'warning',
    size: 'md',
    label: 'Budget Alert',
    description: 'You are approaching your spending limit',
    showPercentage: true,
  },
}

export const Error: Story = {
  args: {
    value: 120,
    max: 100,
    variant: 'error',
    size: 'md',
    label: 'Over Budget',
    description: 'You have exceeded your planned budget',
    showPercentage: true,
  },
}

export const WithValues: Story = {
  args: {
    value: 23,
    max: 50,
    variant: 'disney',
    size: 'md',
    label: 'Tasks Completed',
    showValues: true,
    showPercentage: true,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <ProgressBar
        value={65}
        variant="disney"
        size="sm"
        label="Small Progress Bar"
        showPercentage
      />
      <ProgressBar
        value={65}
        variant="disney"
        size="md"
        label="Medium Progress Bar"
        showPercentage
      />
      <ProgressBar
        value={65}
        variant="disney"
        size="lg"
        label="Large Progress Bar"
        showPercentage
      />
      <ProgressBar
        value={65}
        variant="disney"
        size="xl"
        label="Extra Large Progress Bar"
        showPercentage
      />
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <ProgressBar value={60} variant="default" label="Default" showPercentage />
      <ProgressBar value={60} variant="disney" label="Disney Magic" showPercentage />
      <ProgressBar value={60} variant="premium" label="Premium" showPercentage />
      <ProgressBar value={60} variant="park" label="Park Special" showPercentage />
      <ProgressBar value={60} variant="success" label="Success" showPercentage />
      <ProgressBar value={60} variant="warning" label="Warning" showPercentage />
      <ProgressBar value={60} variant="error" label="Error" showPercentage />
    </div>
  ),
}

// Specialized component stories
export const BudgetProgressStory: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <BudgetProgress
        spent={750}
        budget={1000}
        category="Accommodation"
        currency="£"
      />
      <BudgetProgress
        spent={450}
        budget={500}
        category="Park Tickets"
        currency="£"
      />
      <BudgetProgress
        spent={320}
        budget={300}
        category="Dining"
        currency="£"
      />
    </div>
  ),
}

export const PackingProgressStory: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <PackingProgress
        completed={15}
        total={25}
        essential={8}
        completedEssential={6}
      />
      <PackingProgress
        completed={45}
        total={45}
        essential={12}
        completedEssential={12}
      />
      <PackingProgress
        completed={8}
        total={20}
        essential={5}
        completedEssential={2}
      />
    </div>
  ),
}

export const TaskProgressStory: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <TaskProgress
        completed={3}
        total={10}
        title="Trip Planning Tasks"
      />
      <TaskProgress
        completed={7}
        total={10}
        title="Booking Progress"
      />
      <TaskProgress
        completed={10}
        total={10}
        title="Preparation Complete"
      />
    </div>
  ),
}

export const InteractiveDemo: Story = {
  render: () => {
    const progressValues = [25, 50, 75, 90, 100]

    return (
      <div className="space-y-8 w-96">
        <div>
          <h3 className="text-lg font-semibold mb-4">Disney Trip Progress</h3>
          <div className="space-y-4">
            {progressValues.map((value, index) => (
              <ProgressBar
                key={index}
                value={value}
                variant="disney"
                label={`Step ${index + 1}`}
                description={value === 100 ? 'Complete!' : `${100 - value}% remaining`}
                showPercentage
                animated={value < 100}
              />
            ))}
          </div>
        </div>
      </div>
    )
  },
}