# Daily Parish Design System — Implementation Guide

## Overview

This design system is based on the Calmo UI patterns but adapted for Daily Parish with a liturgical green color scheme. It's designed to work seamlessly with Tailwind CSS in v0.dev.

---

## Color Philosophy

### Primary: Liturgical Green (#2d5a3f)

This is the traditional color of Catholic priest vestments during Ordinary Time — the longest season of the liturgical calendar. It represents:
- Growth and hope
- Life and renewal
- The everyday journey of faith

The color palette scales from very light (#f0f5f0) to very dark (#0a1910), giving you flexibility for backgrounds, text, and accents.

### Secondary: Warm Cream (#faf9f6)

A warm off-white that feels more inviting than pure white. Used for backgrounds to create a calm, parchment-like feel reminiscent of prayer books.

### Accent: Muted Gold (#c9a227)

Reserved for special moments — streak milestones, completion celebrations. References the gold in Catholic iconography without being garish.

---

## Tailwind Configuration

Add this to your `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5f0',
          100: '#d9e6d9',
          200: '#b3cdb3',
          300: '#8db48d',
          400: '#679b67',
          500: '#2d5a3f',
          600: '#264d36',
          700: '#1f402d',
          800: '#183324',
          900: '#11261b',
          950: '#0a1910',
          DEFAULT: '#2d5a3f',
        },
        secondary: {
          50: '#faf9f6',
          100: '#f5f3ed',
          200: '#ebe7db',
          300: '#e0dbc9',
          400: '#d6cfb7',
          500: '#ccc3a5',
          DEFAULT: '#faf9f6',
        },
        accent: {
          gold: '#c9a227',
          'gold-light': '#e8d48a',
          'gold-muted': '#b8956a',
        },
      },
      fontFamily: {
        heading: ['Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(45, 90, 63, 0.15)',
      },
    },
  },
  plugins: [],
}
```

---

## Component Examples

### Primary Button (Full Width)

```jsx
<button className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 
  text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-300
  disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed">
  Begin Today's Reflection
</button>
```

**Dark mode:**
```jsx
<button className="w-full bg-primary-400 hover:bg-primary-300 active:bg-primary-200 
  text-primary-950 font-semibold py-4 px-6 rounded-xl transition-colors duration-300">
  Begin Today's Reflection
</button>
```

---

### Secondary Button (Outlined)

```jsx
<button className="w-full bg-transparent border-2 border-primary-500 
  text-primary-500 hover:bg-primary-50 font-semibold py-4 px-6 rounded-xl 
  transition-colors duration-300">
  View Reflection History
</button>
```

---

### Text Input

```jsx
<input 
  type="email"
  placeholder="Enter your email"
  className="w-full bg-white border border-neutral-300 rounded-xl py-3 px-4
    text-neutral-900 placeholder-neutral-400
    focus:border-primary-500 focus:border-2 focus:shadow-glow focus:outline-none
    transition-all duration-300"
/>
```

**Dark mode:**
```jsx
<input 
  type="email"
  placeholder="Enter your email"
  className="w-full bg-primary-900 border border-neutral-700 rounded-xl py-3 px-4
    text-white placeholder-neutral-500
    focus:border-primary-400 focus:border-2 focus:outline-none
    transition-all duration-300"
/>
```

---

### Reflection Textarea

```jsx
<textarea 
  placeholder="What stood out to you?"
  className="w-full min-h-[120px] bg-white border border-neutral-200 rounded-xl p-4
    text-neutral-900 placeholder-neutral-400 resize-y
    focus:border-primary-500 focus:border-2 focus:shadow-glow focus:outline-none
    transition-all duration-300 font-body"
/>
```

---

### Card (Elevated)

```jsx
<div className="bg-white rounded-2xl shadow-md p-6">
  <h3 className="font-heading text-xl font-semibold text-neutral-900 mb-2">
    Today's Gospel
  </h3>
  <p className="text-neutral-600">
    Luke 17:1-6
  </p>
</div>
```

**Dark mode:**
```jsx
<div className="bg-primary-800 rounded-2xl shadow-lg p-6">
  <h3 className="font-heading text-xl font-semibold text-white mb-2">
    Today's Gospel
  </h3>
  <p className="text-neutral-300">
    Luke 17:1-6
  </p>
</div>
```

---

### Radio Button Group

```jsx
<div className="space-y-3">
  {options.map((option) => (
    <label 
      key={option.id}
      className="flex items-center p-4 bg-white border border-neutral-200 rounded-xl
        cursor-pointer hover:border-primary-400 transition-colors duration-150
        has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
    >
      <input 
        type="radio" 
        name="selection" 
        value={option.id}
        className="w-5 h-5 border-2 border-neutral-300 rounded-full
          checked:border-primary-500 checked:bg-primary-500
          focus:ring-2 focus:ring-primary-200"
      />
      <span className="ml-3 text-neutral-900 font-medium">{option.label}</span>
    </label>
  ))}
</div>
```

---

### Checkbox with Icon

```jsx
<label className="flex items-center p-4 bg-white border border-neutral-200 rounded-xl
  cursor-pointer hover:border-primary-400 transition-colors duration-150
  has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
  <input 
    type="checkbox"
    className="w-5 h-5 border-2 border-neutral-300 rounded-md
      checked:border-primary-500 checked:bg-primary-500
      focus:ring-2 focus:ring-primary-200"
  />
  <div className="ml-3 flex items-center">
    <HeartIcon className="w-5 h-5 text-primary-500 mr-2" />
    <span className="text-neutral-900 font-medium">Better Sleep</span>
  </div>
</label>
```

---

### Selectable Chip

```jsx
<button 
  className={`px-4 py-2 rounded-xl font-medium transition-all duration-150
    ${selected 
      ? 'bg-primary-100 text-primary-700 border border-primary-500' 
      : 'bg-neutral-100 text-neutral-600 border border-transparent hover:bg-neutral-200'
    }`}
>
  18 - 24
</button>
```

---

### Streak Calendar Cell

```jsx
// Empty cell
<div className="w-3 h-3 bg-neutral-100 rounded-sm" />

// Filled cell (intensity 1-5)
<div className="w-3 h-3 bg-primary-100 rounded-sm" /> // Intensity 1
<div className="w-3 h-3 bg-primary-200 rounded-sm" /> // Intensity 2
<div className="w-3 h-3 bg-primary-400 rounded-sm" /> // Intensity 3
<div className="w-3 h-3 bg-primary-500 rounded-sm" /> // Intensity 4
<div className="w-3 h-3 bg-primary-600 rounded-sm" /> // Intensity 5
```

---

### Progress Bar (Onboarding)

```jsx
<div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
  <div 
    className="h-full bg-primary-500 rounded-full transition-all duration-500"
    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
  />
</div>
```

---

### Acknowledgment Box

```jsx
<div className="bg-secondary-100 rounded-xl p-4 border-l-4 border-primary-500">
  <p className="text-neutral-700 italic leading-relaxed">
    Your reflection on the mustard seed speaks to something real—the idea that 
    even small acts of faith can grow into something unexpected...
  </p>
</div>
```

---

### Audio Player Container

```jsx
<div className="bg-secondary-100 rounded-2xl p-6 flex flex-col items-center">
  <button className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center
    hover:bg-primary-600 transition-colors duration-300 shadow-md">
    <PlayIcon className="w-6 h-6 text-white ml-1" />
  </button>
  <p className="mt-4 text-neutral-600 text-sm">First Reading • 1:32</p>
</div>
```

---

### Breathing Exercise Animation

```jsx
<div className="flex items-center justify-center h-64">
  <div className="relative">
    {/* Outer pulsing ring */}
    <div className="absolute inset-0 bg-primary-300 rounded-full opacity-30 animate-breathe" />
    
    {/* Inner circle */}
    <div className="relative w-32 h-32 bg-primary-500 rounded-full flex items-center justify-center">
      <span className="text-white font-medium">Breathe</span>
    </div>
  </div>
</div>
```

---

### Toast Notification

```jsx
// Success
<div className="bg-green-50 border border-green-500 rounded-xl p-4 flex items-center shadow-lg">
  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
  <p className="text-green-800">Reflection saved successfully</p>
</div>

// Error
<div className="bg-red-50 border border-red-500 rounded-xl p-4 flex items-center shadow-lg">
  <XCircleIcon className="w-5 h-5 text-red-500 mr-3" />
  <p className="text-red-800">Failed to save reflection</p>
</div>
```

---

### Modal

```jsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
    <div className="p-6 pb-4">
      <h2 className="font-heading text-2xl font-semibold text-neutral-900">
        Complete Session?
      </h2>
    </div>
    <div className="px-6 pb-6">
      <p className="text-neutral-600">
        You haven't submitted your Gospel reflection yet. Are you sure you want to exit?
      </p>
    </div>
    <div className="px-6 pb-6 flex gap-3">
      <button className="flex-1 py-3 px-4 border border-neutral-300 rounded-xl
        text-neutral-700 font-medium hover:bg-neutral-50 transition-colors">
        Cancel
      </button>
      <button className="flex-1 py-3 px-4 bg-primary-500 rounded-xl
        text-white font-medium hover:bg-primary-600 transition-colors">
        Exit Anyway
      </button>
    </div>
  </div>
</div>
```

---

## Typography Usage

### Headings (Georgia)

```jsx
// Page title
<h1 className="font-heading text-4xl font-bold text-neutral-900">
  Daily Parish
</h1>

// Section heading
<h2 className="font-heading text-2xl font-semibold text-neutral-900">
  Today's Gospel
</h2>

// Card heading
<h3 className="font-heading text-xl font-semibold text-neutral-900">
  Luke 17:1-6
</h3>
```

### Body Text (Inter)

```jsx
// Primary body
<p className="font-body text-base text-neutral-900 leading-relaxed">
  ...
</p>

// Secondary/muted
<p className="font-body text-sm text-neutral-600">
  ...
</p>

// Scripture text (larger, more line height)
<p className="font-heading text-lg text-neutral-800 leading-loose">
  Jesus said to his disciples...
</p>
```

---

## Dark Mode

For dark mode, add the `dark:` prefix to Tailwind classes:

```jsx
<div className="bg-secondary-50 dark:bg-primary-900 
  text-neutral-900 dark:text-white
  border-neutral-200 dark:border-neutral-700">
  Content
</div>
```

Toggle dark mode by adding/removing the `dark` class on the `<html>` element.

---

## Spacing Guidelines

| Use Case | Spacing |
|----------|---------|
| Between paragraphs | `mb-4` (16px) |
| Between sections | `mb-8` or `mb-12` |
| Card padding | `p-4` to `p-6` |
| Button padding | `py-3 px-6` to `py-4 px-8` |
| Input padding | `py-3 px-4` |
| Icon + text gap | `mr-2` or `ml-3` |
| List item gap | `space-y-3` |

---

## Responsive Patterns

```jsx
// Container with responsive padding
<div className="px-4 md:px-6 lg:px-8 max-w-xl mx-auto">
  ...
</div>

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  ...
</div>

// Responsive text size
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  ...
</h1>
```

---

## Icon Usage

Use [Lucide React](https://lucide.dev) icons with consistent sizing:

```jsx
import { Play, Pause, ChevronRight, Check, X, Calendar, Flame } from 'lucide-react';

// Small (in text)
<Check className="w-4 h-4" />

// Medium (buttons, lists)
<ChevronRight className="w-5 h-5" />

// Large (primary actions)
<Play className="w-6 h-6" />

// Extra large (hero elements)
<Flame className="w-8 h-8" />
```

---

## Accessibility Checklist

- [ ] All interactive elements have `focus:ring` states
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Touch targets are at least 44px
- [ ] Form inputs have associated labels
- [ ] Images have alt text
- [ ] Animations can be disabled with `prefers-reduced-motion`
- [ ] Semantic HTML (headings, buttons, etc.)

---

## File Organization

```
/components
  /ui
    Button.tsx
    Input.tsx
    Card.tsx
    Modal.tsx
    Toast.tsx
    ...
  /features
    AudioPlayer.tsx
    ReflectionInput.tsx
    StreakCalendar.tsx
    BreathingExercise.tsx
    ...
/styles
  globals.css
/lib
  tailwind.config.js
```

---

## Version History

- v1.0 — Initial design system with full component library
