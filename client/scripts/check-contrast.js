#!/usr/bin/env node

/**
 * Contrast validation script for Finsight design tokens
 * Run with: node scripts/check-contrast.js
 */

// Convert HSL to RGB for contrast calculations
function hslToRgb(h, s, l) {
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
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Calculate contrast ratio
function getContrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// Check if contrast meets WCAG AA standards
function meetsWCAGAA(foreground, background) {
  try {
    // Parse HSL values, removing percentage signs
    const [h1, s1, l1] = foreground.split(' ').map(val => parseFloat(val.replace('%', '')))
    const [h2, s2, l2] = background.split(' ').map(val => parseFloat(val.replace('%', '')))

    const [r1, g1, b1] = hslToRgb(h1, s1, l1)
    const [r2, g2, b2] = hslToRgb(h2, s2, l2)

    const lum1 = getRelativeLuminance(r1, g1, b1)
    const lum2 = getRelativeLuminance(r2, g2, b2)

    const contrast = getContrastRatio(lum1, lum2)
    
    return {
      ratio: contrast,
      meetsAA: contrast >= 4.5,
      meetsAAA: contrast >= 7.0
    }
  } catch (error) {
    console.error('Error parsing HSL values:', error)
    return { ratio: 0, meetsAA: false, meetsAAA: false }
  }
}

// Our status colors
const statusColors = {
  good: '142 72% 29%',
  caution: '38 92% 50%',
  risk: '0 72% 51%',
  info: '213 94% 68%'
}

// Test against white background
const whiteBackground = '0 0% 100%'

console.log('🔍 Finsight Design System - Contrast Validation')
console.log('=' .repeat(50))
console.log()

console.log('Testing status colors against white background:')
console.log()

let allPass = true

Object.entries(statusColors).forEach(([name, hsl]) => {
  // For status colors, we need to test the foreground text color against the background
  // Since our status colors are backgrounds, we need to test their foreground colors
  const foregroundColors = {
    good: '0 0% 100%',      // White text on good background
    caution: '0 0% 0%',     // Black text on caution background  
    risk: '0 0% 100%',      // White text on risk background
    info: '0 0% 0%'         // Black text on info background
  }
  
  const foreground = foregroundColors[name]
  const result = meetsWCAGAA(foreground, hsl) // Test foreground against background
  const status = result.meetsAA ? '✅ PASS' : '❌ FAIL'
  
  console.log(`${status} ${name.toUpperCase()}`)
  console.log(`   Background HSL: ${hsl}`)
  console.log(`   Foreground HSL: ${foreground}`)
  console.log(`   Contrast Ratio: ${result.ratio.toFixed(2)}:1`)
  console.log(`   WCAG AA (4.5:1): ${result.meetsAA ? 'PASS' : 'FAIL'}`)
  console.log(`   WCAG AAA (7.0:1): ${result.meetsAAA ? 'PASS' : 'FAIL'}`)
  console.log()
  
  if (!result.meetsAA) {
    allPass = false
  }
})

console.log('=' .repeat(50))
console.log(`🎯 Overall Status: ${allPass ? 'ALL PASS' : 'SOME FAIL'}`)

if (allPass) {
  console.log('🎉 All status colors meet WCAG AA accessibility standards!')
} else {
  console.log('⚠️  Some colors need adjustment to meet accessibility requirements.')
}

console.log()
console.log('💡 Note: WCAG AA requires 4.5:1 contrast ratio for normal text')
console.log('💡 Note: WCAG AAA requires 7.0:1 contrast ratio for normal text')
