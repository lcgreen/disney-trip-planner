import { describe, it, expect, beforeEach } from 'vitest'
import { cn, getSafeTextColor } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn function', () => {
    it('should combine class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'ignored')).toBe('base conditional')
    })

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'valid')).toBe('base valid')
    })

    it('should handle empty strings', () => {
      expect(cn('base', '', 'valid')).toBe('base valid')
    })

    it('should handle objects with boolean values', () => {
      expect(cn('base', { 'conditional': true, 'ignored': false })).toBe('base conditional')
    })

    it('should handle arrays', () => {
      expect(cn('base', ['class1', 'class2'])).toBe('base class1 class2')
    })

    it('should handle nested arrays', () => {
      expect(cn('base', [['class1'], ['class2']])).toBe('base class1 class2')
    })
  })

  describe('getSafeTextColor function', () => {
    it('should return white for dark backgrounds', () => {
      expect(getSafeTextColor('#000000')).toBe('text-white')
      expect(getSafeTextColor('#1a1a1a')).toBe('text-white')
      expect(getSafeTextColor('#333333')).toBe('text-white')
    })

    it('should return black for light backgrounds', () => {
      expect(getSafeTextColor('#ffffff')).toBe('text-black')
      expect(getSafeTextColor('#f0f0f0')).toBe('text-black')
      expect(getSafeTextColor('#e0e0e0')).toBe('text-black')
    })

    it('should handle hex colors without #', () => {
      expect(getSafeTextColor('000000')).toBe('text-white')
      expect(getSafeTextColor('ffffff')).toBe('text-black')
    })

    it('should handle rgb colors', () => {
      expect(getSafeTextColor('rgb(0, 0, 0)')).toBe('text-white')
      expect(getSafeTextColor('rgb(255, 255, 255)')).toBe('text-black')
    })

    it('should handle rgba colors', () => {
      expect(getSafeTextColor('rgba(0, 0, 0, 1)')).toBe('text-white')
      expect(getSafeTextColor('rgba(255, 255, 255, 1)')).toBe('text-black')
    })

    it('should handle hsl colors', () => {
      expect(getSafeTextColor('hsl(0, 0%, 0%)')).toBe('text-white')
      expect(getSafeTextColor('hsl(0, 0%, 100%)')).toBe('text-black')
    })

    it('should handle invalid colors gracefully', () => {
      expect(getSafeTextColor('invalid')).toBe('text-black')
      expect(getSafeTextColor('')).toBe('text-black')
      expect(getSafeTextColor(null as any)).toBe('text-black')
      expect(getSafeTextColor(undefined as any)).toBe('text-black')
    })

    it('should handle edge case colors', () => {
      // Test colors that are close to the threshold
      expect(getSafeTextColor('#666666')).toBe('text-white')
      expect(getSafeTextColor('#999999')).toBe('text-black')
    })
  })
})