import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'


// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock Framer Motion
// Add display names to the motion components
const motionDiv = React.forwardRef(({ children, ...props }: any, ref) =>
  React.createElement('div', { ...props, ref }, children)
)
motionDiv.displayName = 'motion.div'

const motionButton = React.forwardRef(({ children, ...props }: any, ref) =>
  React.createElement('button', { ...props, ref }, children)
)
motionButton.displayName = 'motion.button'

const motionSpan = React.forwardRef(({ children, ...props }: any, ref) =>
  React.createElement('span', { ...props, ref }, children)
)
motionSpan.displayName = 'motion.span'

vi.mock('framer-motion', () => ({
  motion: {
    div: motionDiv,
    button: motionButton,
    span: motionSpan,
  },
  AnimatePresence: ({ children }: any) => (typeof children === 'function' ? children() : children),
}))

// Mock audio
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

// Global test utilities
declare global {
  var testUtils: {
    mockLocalStorage: (data: Record<string, string>) => void
    resetLocalStorage: () => void
  }
}

globalThis.testUtils = {
  mockLocalStorage: (data: Record<string, string>) => {
    localStorageMock.getItem.mockImplementation((key: string) => data[key] || null)
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      data[key] = value
    })
    localStorageMock.removeItem.mockImplementation((key: string) => {
      delete data[key]
    })
    localStorageMock.clear.mockImplementation(() => {
      Object.keys(data).forEach(key => delete data[key])
    })
  },
  resetLocalStorage: () => {
    localStorageMock.getItem.mockReset()
    localStorageMock.setItem.mockReset()
    localStorageMock.removeItem.mockReset()
    localStorageMock.clear.mockReset()
  },
}

