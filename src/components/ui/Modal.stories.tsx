import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Calendar, Settings as SettingsIcon, Star } from 'lucide-react'
import { Modal, ConfirmModal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'disney-gradient',
      values: [
        { name: 'disney-gradient', value: 'linear-gradient(135deg, #003087 0%, #FFD700 100%)' },
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#1e293b' },
      ],
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Wrapper component for interactive stories
const ModalWrapper = ({ children, ...props }: any) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...props} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {children}
      </Modal>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <ModalWrapper
      title="Disney Modal Example"
      description="A magical modal component for your Disney trip planner"
      size="md"
    >
      <p className="text-gray-600 mb-4">
        This is a basic modal with default settings. It includes a close button and responds to escape key and overlay clicks.
      </p>
      <Button variant="disney">Action Button</Button>
    </ModalWrapper>
  ),
}

export const WithForm: Story = {
  render: () => (
    <ModalWrapper
      title="Plan New Trip"
      description="Create a new Disney trip to start planning your magical adventure"
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Trip Name"
          placeholder="My Magical Disney Adventure"
          leftIcon={<Star className="w-4 h-4" />}
        />
        <Input
          label="Trip Date"
          type="date"
          leftIcon={<Calendar className="w-4 h-4" />}
        />
        <div className="flex gap-3 mt-6">
          <Button variant="disney" fullWidth>
            Save Trip
          </Button>
          <Button variant="outline" fullWidth>
            Cancel
          </Button>
        </div>
      </div>
    </ModalWrapper>
  ),
}

export const SettingsModal: Story = {
  render: () => (
    <ModalWrapper
      title="Countdown Settings"
      size="lg"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Display Options
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">Show planning tips</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Enable notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">Auto-save changes</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="disney">Save Settings</Button>
          <Button variant="outline">Reset to Default</Button>
        </div>
      </div>
    </ModalWrapper>
  ),
}

export const Large: Story = {
  render: () => (
    <ModalWrapper
      title="Book Your Disney Stay"
      description="Complete your booking details for the most magical vacation"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          This is a large modal that can accommodate more content. Perfect for detailed forms,
          comprehensive settings panels, or rich content displays.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" placeholder="Mickey" />
          <Input label="Last Name" placeholder="Mouse" />
        </div>
        <Input label="Email" type="email" placeholder="mickey@disney.com" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Check-in Date" type="date" />
          <Input label="Check-out Date" type="date" />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="disney" fullWidth>Book Now</Button>
          <Button variant="outline" fullWidth>Save for Later</Button>
        </div>
      </div>
    </ModalWrapper>
  ),
}

export const Small: Story = {
  render: () => (
    <ModalWrapper
      title="Quick Action"
      size="sm"
    >
      <p className="text-gray-600 mb-4">
        This is a compact modal perfect for simple confirmations or quick actions.
      </p>
      <div className="flex gap-3">
        <Button variant="premium" size="sm" fullWidth>
          Confirm
        </Button>
        <Button variant="outline" size="sm" fullWidth>
          Cancel
        </Button>
      </div>
    </ModalWrapper>
  ),
}

// Confirm Modal Stories
const ConfirmWrapper = ({ ...props }: any) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Show Confirmation</Button>
      <ConfirmModal {...props} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}

export const ConfirmInfo: Story = {
  render: () => (
    <ConfirmWrapper
      title="Save Changes"
      message="Are you sure you want to save these countdown settings? This will overwrite your previous configuration."
      confirmText="Save Changes"
      cancelText="Keep Editing"
      onConfirm={() => console.log('Changes saved!')}
      variant="info"
    />
  ),
}

export const ConfirmWarning: Story = {
  render: () => (
    <ConfirmWrapper
      title="Reset Settings"
      message="This will reset all your customisation settings to default values. This action cannot be undone."
      confirmText="Reset Settings"
      cancelText="Keep Current"
      onConfirm={() => console.log('Settings reset!')}
      variant="warning"
    />
  ),
}

export const ConfirmDanger: Story = {
  render: () => (
    <ConfirmWrapper
      title="Delete Trip"
      message="Are you sure you want to delete this Disney trip? All planning data, itineraries, and saved information will be permanently removed."
      confirmText="Delete Trip"
      cancelText="Keep Trip"
      onConfirm={() => console.log('Trip deleted!')}
      variant="danger"
    />
  ),
}