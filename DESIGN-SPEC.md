# Votive Design Specification

*For implementation by Bulma 🔧*

**Author:** Edna Mode 👓  
**Signed off:** Pelumi, 2026-02-12  
**Status:** Ready for build

---

## Design Philosophy

**"Chapel energy."** Quiet confidence. The app doesn't try to impress. It simply *is*.

- Bold typography, soft moments
- Warm and sacred, not cold or clinical  
- Perpetually present tense
- Empty input = invitation, not pressure

**Key principle:** Every animation, every transition, every moment of silence must be earned. The spell breaks if execution isn't intentional.

---

## Token Updates

All tokens are in `src/theme/tokens.ts`. Key changes from previous:

### Spacing (Updated)
```typescript
spacing = {
  xs: 4,
  sm: 8,
  md: 16,   // changed from 12
  lg: 24,   // changed from 16
  xl: 32,   // changed from 20
  '2xl': 48, // changed from 24
  '3xl': 64,
  '4xl': 80,
}
```

### Colors (Updated)
```typescript
// Light surface is warmer
bg.surface: '#FAF9F6'  // was #F8F7F4

// Accent split into two roles
accent.primary: '#3D5A47'  // green — identity, links, badges
accent.cta: '#C9954A'       // burnished gold — buttons, actions (candlelight)
```

### Typography (Updated)
- Georgia for display, titles, scripture
- System for body, captions
- No Inter dependency

---

## Component Specifications

### 1. TabBar

**Layout:**
- Height: 56px (plus safe area)
- 3 tabs: Today | Prayers | Settings

**Visual:**
| State | Icon | Label Color |
|-------|------|-------------|
| Inactive | Outline stroke | `text.muted` |
| Active | Filled | `accent.primary` (green) |

**Icons:**
- Today: Flame (🔥 style, custom)
- Prayers: Heart
- Settings: Gear

**Behavior:**
- Haptic on tab switch (`impactLight`)
- No animation between tabs (instant switch)
- Hides when keyboard is open

**Implementation:**
```typescript
import { tabBar } from '../theme/tokens';

// Use tabBar.height, tabBar.activeColor, etc.
```

---

### 2. PrayerInput

**Layout:**
```
┌─────────────────────────────────────┐
│ What's on your heart today?         │
│                                     │
│                                     │
│                                     │ ← min 120px
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│              Amen                   │ ← full width button
└─────────────────────────────────────┘
```

**States:**

| State | Border | Button |
|-------|--------|--------|
| Empty | 1px `border` | "Amen" at 40% opacity |
| Focused | 2px `accent.cta` (orange) | "Amen" at 40% opacity |
| Has text | 2px `accent.cta` | "Amen" full opacity, tappable |
| Submitting | 2px `accent.cta` | Loading spinner |

**Specs:**
- Min height: 120px
- Padding: `spacing.md` (16px)
- Border radius: `radius.md` (12px)
- Placeholder: "What's on your heart today?"
- Placeholder color: `text.muted`
- Font: `typography.body`

**Button:**
- Background: `accent.cta` (orange)
- Text: white, `typography.bodyStrong`
- Height: 52px
- Border radius: `radius.sm` (8px)
- Margin top: `spacing.sm` (8px)

**Behavior:**
- Keyboard opens → view scrolls, TabBar hides
- "Amen" button stays above keyboard (sticky)
- On submit: haptic (`notificationSuccess`), hold 1.5s, toast, reset

**Copy:**
- Placeholder: "What's on your heart today?"
- Subtext (below input): "A prayer, a thought, or nothing at all."
- Button: "Amen"

---

### 3. Toast

**Standard Toast:**
```
┌─────────────────────────────────────┐
│  Saved.                             │
└─────────────────────────────────────┘
```

**Milestone Toast:**
```
┌─────────────────────────────────────┐
│  Your first prayer. Welcome. 🙏     │
└─────────────────────────────────────┘
```

**Visual:**
- Background: `bg.elevated` (white)
- Border: 1px `border`
- Shadow: `shadow.medium`
- Border radius: `radius.md`
- Padding: `spacing.md` horizontal, `spacing.sm` vertical
- Text: `typography.body`, `text.primary`
- Position: bottom of screen, above TabBar, centered

**Animation — Standard:**
```typescript
{
  fadeIn: 200ms ease-out,
  hold: 1500ms,
  fadeOut: 300ms ease-in,
  translateY: 20px → 0 → 20px
}
```

**Animation — Milestone:**
```typescript
{
  fadeIn: 300ms ease-out,
  hold: 2000ms,
  fadeOut: 400ms ease-in,
  // Subtle pulse on entry
  scale: 1.0 → 1.02 → 1.0 over 600ms (200ms each phase)
}
```

**Toast Messages:**

| Trigger | Message |
|---------|---------|
| Prayer saved (first ever) | "Your first prayer. Welcome. 🙏" |
| Prayer saved (subsequent) | "Saved." |
| Day 2 | "You came back." |
| Day 7 | "A week of showing up." |
| Day 14 | "Two weeks. The rhythm is yours." |
| Day 30 | "One month. This is becoming practice." |
| Day 180 | "Six months. You stayed." |
| Day 365 | "A year. 🙏" |

---

### 4. AudioCard

**Collapsed State:**
```
┌─────────────────────────────────────┐
│  [▶]  Today's Reading      ~5 min   │
└─────────────────────────────────────┘
```

**Expanded State:**
```
┌─────────────────────────────────────┐
│  [⏸]  Today's Reading     2:34/5:00 │
│  ═══════════●─────────────────────  │ ← progress bar
│  See full reading →                 │
└─────────────────────────────────────┘
```

**Completed State:**
```
┌─────────────────────────────────────┐
│  [✓]  Today's Reading      Done     │
└─────────────────────────────────────┘
```

**Specs:**
- Play button: 48px circle, `accent.primary` (green) background
- Icon: white, 24px
- Progress bar: 4px height, 24px touch target
- Progress fill: `accent.primary`
- Progress track: `bg.subtle`

**Behavior:**
- Tap play → expand, start playback
- Tap anywhere on card (when playing) → collapse/expand toggle
- Scrub gesture on progress bar (already implemented)
- On complete: haptic (`notificationSuccess`), collapse, show checkmark
- Checkmark fades in over 300ms

---

### 5. Delete Confirmation

**Trigger:** User taps delete on a prayer

**Modal:**
```
┌─────────────────────────────────────┐
│                                     │
│       Delete this prayer?           │
│                                     │
│   ┌─────────┐    ┌─────────────┐   │
│   │ Cancel  │    │   Delete    │   │
│   └─────────┘    └─────────────┘   │
└─────────────────────────────────────┘
```

**Specs:**
- Use native Alert on iOS
- Title: "Delete this prayer?"
- No message body (title is enough)
- Cancel: default style
- Delete: destructive style

---

## Onboarding Flow

### Screen 1: Welcome

**Layout:**
- Centered vertically
- Votive wordmark at top (small, `text.muted`)
- Optional: 🕯️ emoji above wordmark, very subtle

**Copy:**
```
Welcome back.

A daily reading. A moment to pray.
Just between you and God.

[Continue]
```

**Typography:**
- "Welcome back." — `displayLg`, `text.primary`
- Body text — `body`, `text.secondary`
- Button — full width, `accent.cta`

---

### Screen 2: Notifications

**Layout:**
- Centered
- Time picker as hero

**Copy:**
```
A quiet reminder?

One notification a day.
At the time you choose.

[Time Picker: 8:00 AM]

[Not now]  [Set reminder]
```

**Buttons:**
- "Not now" — ghost style, `text.secondary`
- "Set reminder" — `accent.cta`

**Behavior:**
- "Set reminder" → request permission, advance
- "Not now" → advance without permission prompt

---

### Screen 3: Begin

**Copy:**
```
Your first reading is ready.

[Begin]
```

**Typography:**
- Single line — `displayMd`, `text.primary`
- Button — full width, `accent.cta`

---

### Transitions

- Between screens: fade + slide up, 300ms, `ease-out`
- Into Today screen: fade + subtle scale (0.98 → 1.0), 400ms

### No Progress Indicator

Three screens. Too short to need dots.

---

## Keyboard Behavior

When prayer input is focused:

1. TabBar hides (animated, 200ms)
2. View scrolls to keep input visible
3. "Amen" button stays above keyboard
4. On dismiss: TabBar returns (animated, 200ms)

---

## Error States

**Readings fail to load:**
```
┌─────────────────────────────────────┐
│                                     │
│     [cloud-offline icon]            │
│                                     │
│  Something went wrong.              │
│  Tap to try again.                  │
│                                     │
└─────────────────────────────────────┘
```

- No "Error 500" — keep it human
- Tappable to retry
- Icon: `text.muted`, 48px

**Audio fails:**
- Toast: "Audio unavailable. Read the text instead."
- "See full reading" link becomes prominent

**Network lost mid-session:**
- Prayer input still works (local)
- Audio playback continues if buffered
- On next action requiring network: gentle error toast

---

## Reading History

**Access:** Tap the date in Today screen header

**Trigger:** Date text ("Thursday, February 12") is tappable, indicated by subtle chevron (▾)

### Date Picker Sheet

```
┌─────────────────────────────────────┐
│ Thursday, February 12    ← Today    │
│ Wednesday, February 11              │
│ Tuesday, February 10                │
│ Monday, February 9                  │
│ Sunday, February 8                  │
│ Saturday, February 7                │
│ Friday, February 6                  │
└─────────────────────────────────────┘
```

- Shows last 7 days
- Today marked with "← Today" label
- Tap a date → loads that day's reading
- Sheet slides up, standard iOS presentation

### Past Date View

**Header transforms:**
```
TODAY:
┌─────────────────────────────────────┐
│ Good afternoon                      │
│ Thursday, February 12  ▾            │
└─────────────────────────────────────┘

PAST DATE:
┌─────────────────────────────────────┐
│ ← Today                             │
│ Tuesday, February 10  ▾             │
│ • Memorial of St. Scholastica       │
└─────────────────────────────────────┘
```

- Greeting replaced with "← Today" back link
- Date still tappable to pick another day
- Liturgical context shows that day's info

**Content:**
- Audio card loads that day's `audio_unified_url`
- Scripture shows that day's readings
- Commentary shows that day's commentary
- Audio is fully playable

**Prayer Input:**
- **Stays visible** on past dates
- Prompt unchanged: "What's on your heart today?"
- Prayer saves with TODAY's date (prayer is always now)
- Philosophy: The reading may be old, but the prayer is a present-moment act

**"← Today" link:**
- Tapping returns to current day
- Position: top left, replaces greeting
- Style: `accent.primary` (green), `bodyStrong`

---

## Dark Mode

**Status:** Toggle exists in Settings. Tokens defined for both modes.

---

## What NOT to Build

- Streak counters or badges (track internally, never display)
- Auto-play audio
- Skip button in onboarding
- Progress dots in onboarding
- Confetti or celebration animations
- Any copy with exclamation marks

---

## Files Updated

- `src/theme/tokens.ts` — all tokens refreshed
- `src/theme/index.ts` — exports updated

---

## Questions?

Reach out to Edna 👓 or Pepper 🌶️.

*Chapel energy. Make it real.* 🕯️
