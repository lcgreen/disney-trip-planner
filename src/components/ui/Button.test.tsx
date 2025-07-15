import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('should render with custom className', () => {
    render(<Button className="custom-class">Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toHaveClass('custom-class')
  })

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="disney">Disney</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r', 'from-disney-blue', 'to-disney-purple')

    rerender(<Button variant="premium">Premium</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gradient-to-r', 'from-disney-gold', 'to-disney-orange')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border', 'border-gray-300')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-white', 'border', 'border-gray-300')

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-gray-700', 'hover:bg-gray-100')

    rerender(<Button variant="link">Link</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-disney-blue', 'underline-offset-4')
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10', 'px-6', 'text-base')

    rerender(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8', 'px-4', 'text-sm')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-12', 'px-8', 'text-lg')

    rerender(<Button size="xl">Extra Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-14', 'px-10', 'text-xl')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('should not trigger click when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)

    const button = screen.getByRole('button', { name: 'Disabled' })
    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should render as different HTML elements', () => {
    const { rerender } = render(<Button asChild><a href="/test">Link</a></Button>)
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/test')

    rerender(<Button asChild><span>Span</span></Button>)
    expect(screen.getByText('Span')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    render(<Button loading>Loading</Button>)

    const button = screen.getByRole('button', { name: 'Loading' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('should render with icon', () => {
    const TestIcon = () => <span data-testid="icon">🚀</span>
    render(<Button icon={<TestIcon />}>With Icon</Button>)

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })

  it('should handle keyboard events', () => {
    const handleKeyDown = vi.fn()
    render(<Button onKeyDown={handleKeyDown}>Keyboard</Button>)

    const button = screen.getByRole('button', { name: 'Keyboard' })
    fireEvent.keyDown(button, { key: 'Enter' })

    expect(handleKeyDown).toHaveBeenCalledTimes(1)
  })

  it('should handle focus events', () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()

    render(
      <Button onFocus={handleFocus} onBlur={handleBlur}>
        Focus
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Focus' })
    fireEvent.focus(button)
    fireEvent.blur(button)

    expect(handleFocus).toHaveBeenCalledTimes(1)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('should handle mouse events', () => {
    const handleMouseEnter = vi.fn()
    const handleMouseLeave = vi.fn()

    render(
      <Button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        Mouse
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Mouse' })
    fireEvent.mouseEnter(button)
    fireEvent.mouseLeave(button)

    expect(handleMouseEnter).toHaveBeenCalledTimes(1)
    expect(handleMouseLeave).toHaveBeenCalledTimes(1)
  })

  it('should handle form submission', () => {
    const handleSubmit = vi.fn()
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Submit</Button>
      </form>
    )

    const button = screen.getByRole('button', { name: 'Submit' })
    fireEvent.click(button)

    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('should handle form reset', () => {
    const handleReset = vi.fn()
    render(
      <form onReset={handleReset}>
        <Button type="reset">Reset</Button>
      </form>
    )

    const button = screen.getByRole('button', { name: 'Reset' })
    fireEvent.click(button)

    expect(handleReset).toHaveBeenCalledTimes(1)
  })

  it('should handle button type', () => {
    const { rerender } = render(<Button type="button">Button</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')

    rerender(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')

    rerender(<Button type="reset">Reset</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')
  })

  it('should handle custom data attributes', () => {
    render(<Button data-testid="custom-button" data-custom="value">Custom</Button>)

    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('data-custom', 'value')
  })

  it('should handle aria attributes', () => {
    render(
      <Button aria-label="Custom label" aria-describedby="description">
        Aria
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Custom label' })
    expect(button).toHaveAttribute('aria-describedby', 'description')
  })

  it('should handle ref forwarding', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>Ref</Button>)

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
  })

  it('should handle complex children', () => {
    render(
      <Button>
        <span>Text</span>
        <strong>Bold</strong>
      </Button>
    )

    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Bold')).toBeInTheDocument()
  })

  it('should handle empty children', () => {
    render(<Button />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('')
  })

  it('should handle multiple event handlers', () => {
    const handlers = {
      onClick: vi.fn(),
      onDoubleClick: vi.fn(),
      onMouseDown: vi.fn(),
      onMouseUp: vi.fn(),
      onKeyUp: vi.fn(),
      onKeyPress: vi.fn()
    }

    render(<Button {...handlers}>Multiple Events</Button>)

    const button = screen.getByRole('button', { name: 'Multiple Events' })

    fireEvent.click(button)
    fireEvent.doubleClick(button)
    fireEvent.mouseDown(button)
    fireEvent.mouseUp(button)
    fireEvent.keyUp(button, { key: 'a' })
    fireEvent.keyPress(button, { key: 'a' })

    expect(handlers.onClick).toHaveBeenCalledTimes(1)
    expect(handlers.onDoubleClick).toHaveBeenCalledTimes(1)
    expect(handlers.onMouseDown).toHaveBeenCalledTimes(1)
    expect(handlers.onMouseUp).toHaveBeenCalledTimes(1)
    expect(handlers.onKeyUp).toHaveBeenCalledTimes(1)
    expect(handlers.onKeyPress).toHaveBeenCalledTimes(1)
  })
})