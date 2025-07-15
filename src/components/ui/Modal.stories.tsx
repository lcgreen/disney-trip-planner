import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { Calendar, Settings as SettingsIcon, Star, Trash2 } from 'lucide-react'
import { Modal, ConfirmModal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'

const meta: Meta<typeof Modal> = {
  title: 'Disney UI/Modal',
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
    docs: {
      description: {
        component: 'A magical modal component built with Radix UI primitives and Disney theming. Provides excellent accessibility, customizable animations, and full keyboard navigation support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Size of the modal',
    },
    showCloseButton: {
      control: { type: 'boolean' },
      description: 'Whether to show the close button in the header',
    },
    closeOnOverlayClick: {
      control: { type: 'boolean' },
      description: 'Whether clicking the overlay closes the modal',
    },
    closeOnEscape: {
      control: { type: 'boolean' },
      description: 'Whether pressing escape closes the modal',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic Modal Example
export const BasicModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>
          Open Basic Modal
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Welcome to Disney Trip Planner!"
          description="Plan your magical Disney adventure with our comprehensive suite of tools."
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This is a basic modal with Disney theming. It includes proper focus management,
              keyboard navigation, and accessibility features powered by Radix UI.
            </p>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="disney" onClick={() => setIsOpen(false)}>
                Get Started
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  },
}

// Form Modal Example
export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} icon={<Calendar />}>
          Plan New Trip
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Plan Your Disney Adventure"
          description="Tell us about your upcoming Disney trip to create a personalized experience."
          size="lg"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Trip Name"
                placeholder="e.g., Smith Family Disney Adventure"
                variant="disney"
              />
              <Input
                label="Number of Guests"
                type="number"
                placeholder="4"
                variant="disney"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Check-in Date"
                type="date"
                variant="disney"
              />
              <Input
                label="Check-out Date"
                type="date"
                variant="disney"
              />
            </div>

            <Input
              label="Special Occasions"
              placeholder="Birthday, Anniversary, etc."
              variant="disney"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="disney" icon={<Star />}>
                Create Trip Plan
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    )
  },
}

// Settings Modal Example
export const SettingsModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} icon={<SettingsIcon />} variant="premium">
          Trip Settings
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Trip Settings"
          description="Customize your Disney trip planning experience."
          size="md"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Preferences</h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700">Enable park alerts</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Show wait times</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700">Budget tracking</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Notifications</h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-sm text-gray-700">Trip countdown updates</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Budget alerts</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="premium" onClick={() => setIsOpen(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  },
}

// Confirmation Modal Example
export const ConfirmationModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleConfirm = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsLoading(false)
      setIsOpen(false)
    }

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} icon={<Trash2 />} variant="secondary">
          Delete Trip Plan
        </Button>

        <ConfirmModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={handleConfirm}
          title="Delete Trip Plan"
          description="Are you sure you want to delete this trip plan? This action cannot be undone and all your planning data will be permanently removed."
          confirmText="Delete Plan"
          cancelText="Keep Plan"
          destructive
          loading={isLoading}
        />
      </div>
    )
  },
}

// Full Screen Modal Example
export const FullScreenModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div>
        <Button onClick={() => setIsOpen(true)} variant="hollywoodStudios">
          Open Full Experience
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Disney Park Explorer"
          description="Immersive park exploration experience"
          size="full"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Park Cards */}
              {[
                { name: 'Magic Kingdom', color: 'from-blue-500 to-purple-600' },
                { name: 'EPCOT', color: 'from-purple-500 to-pink-600' },
                { name: 'Hollywood Studios', color: 'from-red-500 to-orange-600' },
                { name: 'Animal Kingdom', color: 'from-green-500 to-teal-600' },
                { name: 'Disneyland', color: 'from-orange-500 to-red-600' },
                { name: 'California Adventure', color: 'from-yellow-500 to-orange-500' },
              ].map((park) => (
                <div
                  key={park.name}
                  className={`bg-gradient-to-br ${park.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}
                >
                  <h3 className="text-xl font-bold mb-2">{park.name}</h3>
                  <p className="text-white/90 mb-4">
                    Explore attractions, dining, and entertainment options.
                  </p>
                  <Button variant="secondary" size="sm">
                    Explore Park
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Button variant="outline" onClick={() => setIsOpen(false)} size="lg">
                Close Explorer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  },
}

// Size Variants
export const SizeVariants: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null)

    const sizes = [
      { key: 'sm', label: 'Small', variant: 'outline' as const },
      { key: 'md', label: 'Medium', variant: 'disney' as const },
      { key: 'lg', label: 'Large', variant: 'premium' as const },
      { key: 'xl', label: 'Extra Large', variant: 'magicKingdom' as const },
    ]

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {sizes.map((size) => (
            <Button
              key={size.key}
              onClick={() => setOpenModal(size.key)}
              variant={size.variant}
            >
              {size.label} Modal
            </Button>
          ))}
        </div>

        {sizes.map((size) => (
          <Modal
            key={size.key}
            isOpen={openModal === size.key}
            onClose={() => setOpenModal(null)}
            title={`${size.label} Modal`}
            description={`This is a ${size.label.toLowerCase()} modal example demonstrating the ${size.key} size variant.`}
            size={size.key as any}
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                This modal demonstrates the <strong>{size.key}</strong> size variant.
                It automatically adjusts its width and height based on the size prop.
              </p>

              <div className="flex justify-end">
                <Button variant="disney" onClick={() => setOpenModal(null)}>
                  Perfect Size!
                </Button>
              </div>
            </div>
          </Modal>
        ))}
      </div>
    )
  },
}