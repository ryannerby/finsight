/**
 * Utility functions for checking contrast ratios and accessibility compliance
 */

// Convert HSL to RGB for contrast calculations
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ]
}

// Calculate relative luminance
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Calculate contrast ratio
function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// Check if contrast meets WCAG AA standards
export function meetsWCAGAA(foreground: string, background: string): boolean {
  // Parse HSL values (assuming format like "142 72% 29%")
  const parseHSL = (hsl: string): [number, number, number] => {
    const [h, s, l] = hsl.split(' ').map(Number)
    return [h, s, l]
  }

  try {
    const [h1, s1, l1] = parseHSL(foreground)
    const [h2, s2, l2] = parseHSL(background)

    const [r1, g1, b1] = hslToRgb(h1, s1, l1)
    const [r2, g2, b2] = hslToRgb(h2, s2, l2)

    const lum1 = getRelativeLuminance(r1, g1, b1)
    const lum2 = getRelativeLuminance(r2, g2, b2)

    const contrast = getContrastRatio(lum1, lum2)
    
    // WCAG AA requires 4.5:1 for normal text
    return contrast >= 4.5
  } catch (error) {
    console.error('Error parsing HSL values:', error)
    return false
  }
}

// Check all our status color combinations
export function validateStatusColors(): Record<string, boolean> {
  const statusColors = {
    good: '142 72% 29%',
    caution: '38 92% 50%',
    risk: '0 72% 51%',
    info: '213 94% 68%'
  }

  const results: Record<string, boolean> = {}

  // Check each status color against white background
  Object.entries(statusColors).forEach(([name, hsl]) => {
    const meetsAA = meetsWCAGAA(hsl, '0 0% 100%') // White background
    results[name] = meetsAA
  })

  return results
}

// Log contrast validation results
export function logContrastValidation(): void {
  console.log('🔍 Validating Status Color Contrast Ratios...')
  
  const results = validateStatusColors()
  
  Object.entries(results).forEach(([name, meetsAA]) => {
    const status = meetsAA ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${name}: ${meetsAA ? 'WCAG AA compliant' : 'Below WCAG AA threshold'}`)
  })
  
  const allPass = Object.values(results).every(Boolean)
  console.log(`\n🎯 Overall Status: ${allPass ? 'ALL PASS' : 'SOME FAIL'}`)
  
  if (allPass) {
    console.log('🎉 All status colors meet WCAG AA accessibility standards!')
  } else {
    console.log('⚠️  Some colors need adjustment to meet accessibility requirements.')
  }
}
