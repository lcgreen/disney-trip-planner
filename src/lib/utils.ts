import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to combine and merge Tailwind CSS classes
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate the relative luminance of a color
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Relative luminance (0-1)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 First color in any format (hex, rgb, rgba, hsl)
 * @param color2 Second color in any format (hex, rgb, rgba, hsl)
 * @returns Contrast ratio (1-21)
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = colorToRgb(color1);
  const rgb2 = colorToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Convert hex color to RGB
 * @param hex Hex color string (e.g., "#ffffff" or "ffffff")
 * @returns RGB object or null if invalid
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Add # if missing
  const hexWithHash = hex.startsWith('#') ? hex : `#${hex}`;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexWithHash);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert color string to RGB
 * @param color Color string in hex, rgb, rgba, or hsl format
 * @returns RGB object or null if invalid
 */
function colorToRgb(color: string): { r: number; g: number; b: number } | null {
  // Handle null/undefined
  if (!color) {
    return null;
  }

  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }

  // Handle rgb colors
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }

  // Handle rgba colors
  const rgbaMatch = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3])
    };
  }

  // Handle hsl colors
  const hslMatch = color.match(/^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
    };
  }

  return null;
}

/**
 * Get optimal text color (black or white) based on background color
 * @param backgroundColor Background color in any format (hex, rgb, rgba, hsl)
 * @returns "text-white" or "text-black" Tailwind class
 */
export function getOptimalTextColor(backgroundColor: string): "text-white" | "text-black" {
  // If color is invalid, default to black
  if (!backgroundColor || !colorToRgb(backgroundColor)) {
    return "text-black";
  }
  const whiteContrast = getContrastRatio(backgroundColor, "#ffffff");
  const blackContrast = getContrastRatio(backgroundColor, "#000000");
  // Return the color with better contrast (WCAG AA standard is 4.5:1)
  return whiteContrast > blackContrast ? "text-white" : "text-black";
}

/**
 * Check if a color combination meets WCAG contrast requirements
 * @param backgroundColor Background color in any format (hex, rgb, rgba, hsl)
 * @param textColor Text color in any format (hex, rgb, rgba, hsl)
 * @param level WCAG level: "AA" (4.5:1) or "AAA" (7:1)
 * @returns Boolean indicating if contrast requirement is met
 */
export function meetsContrastRequirement(
  backgroundColor: string,
  textColor: string,
  level: "AA" | "AAA" = "AA"
): boolean {
  const contrast = getContrastRatio(backgroundColor, textColor);
  const requirement = level === "AA" ? 4.5 : 7;
  return contrast >= requirement;
}

/**
 * Get a safe text color that meets contrast requirements
 * @param backgroundColor Background color in any format (hex, rgb, rgba, hsl)
 * @param preferredColor Preferred text color ("white" or "black")
 * @param level WCAG level to meet
 * @returns Tailwind text color class that meets contrast requirements
 */
export function getSafeTextColor(
  backgroundColor: string,
  preferredColor: "white" | "black" = "white",
  level: "AA" | "AAA" = "AA"
): "text-white" | "text-black" | "text-gray-700" | "text-gray-200" {
  // Explicitly handle pure black and pure white backgrounds (with or without #)
  const normalized = (backgroundColor || '').replace(/^#/, '').toLowerCase();
  if (normalized === '000000' && preferredColor === 'white') {
    return 'text-white';
  }
  if (normalized === 'ffffff' && preferredColor === 'black') {
    return 'text-black';
  }
  // If color is invalid, default to black
  if (!backgroundColor || !colorToRgb(backgroundColor)) {
    return "text-black";
  }
  // Now do contrast logic
  const preferredHex = preferredColor === "white" ? "#ffffff" : "#000000";
  if (meetsContrastRequirement(backgroundColor, preferredHex, level)) {
    return preferredColor === "white" ? "text-white" : "text-black";
  }
  // If preferred color doesn't meet requirements, try alternatives
  const alternatives = [
    { color: "#000000", class: "text-black" as const },
    { color: "#ffffff", class: "text-white" as const },
    { color: "#374151", class: "text-gray-700" as const }, // gray-700
    { color: "#e5e7eb", class: "text-gray-200" as const }  // gray-200
  ];
  for (const alt of alternatives) {
    if (meetsContrastRequirement(backgroundColor, alt.color, level)) {
      return alt.class;
    }
  }
  // Fallback to optimal color if nothing meets requirements
  return getOptimalTextColor(backgroundColor);
}