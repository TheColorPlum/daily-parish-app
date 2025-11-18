# Daily Parish — Task Plan

## Current Status

**Last Updated:** 2025-11-18
**Current Task:** 1.1 USCCB Scraper Function
**Phase:** 1 - Content Pipeline

---

## Architecture

```
┌─────────────────────────────────────────┐
│      daily-parish.vercel.app            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │        Landing Page               │  │
│  │  - Hero + value prop              │  │
│  │  - Email waitlist                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │        Cron Endpoint              │  │
│  │  /api/cron/generate-daily         │  │
│  │  - Runs daily at 2 AM EST         │  │
│  │  - Fetches readings               │  │
│  │  - Generates commentary + audio   │  │
│  │  - Stores in Supabase             │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              Supabase                   │
│  - Auth (email, Google, Apple)          │
│  - Database (users, sessions, readings) │
│  - Storage (audio files)                │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│       Expo App (iOS + Android)          │
│  - All user interaction                 │
│  - Reflection sessions                  │
│  - Subscription management              │
└─────────────────────────────────────────┘
```

---

## Phase 0: Project Setup

### Task 0.1: Initialize Expo Project ✅
- Expo project created with tabs template
- TypeScript configured
- Expo Router working
- Pushed to GitHub: `daily-parish-app`

### Task 0.2: Configure Supabase Project ✅
- Project created via Vercel integration
- All tables created (users, sessions, daily_readings, analytics_events)
- RLS policies active
- Email auth enabled
- Storage bucket "audio" created with public access
- Environment variables connected to Vercel

### Task 0.3: Configure Environment & Dependencies ✅
- Core packages installed (@supabase/supabase-js, expo-av, expo-secure-store, react-native-purchases)
- `lib/supabase.ts` created with SecureStore adapter
- `.env` configured with Supabase credentials
- App runs without errors

### Task 0.4: Configure EAS Build
**Set up Expo Application Services**

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Update `app.json` with bundle identifiers.

**Acceptance Criteria:**
- [ ] `eas.json` created
- [ ] Can run `eas build --platform ios --profile development`
- [ ] Development build installs on device/simulator

### Task 0.5: Configure RevenueCat
**Set up subscription management**

1. Create RevenueCat account
2. Create project "Daily Parish"
3. Add iOS + Android apps
4. Create Entitlement: "premium"
5. Create Offering with monthly package ($4.99)
6. Get API keys

**Acceptance Criteria:**
- [ ] RevenueCat project configured
- [ ] API keys added to `.env`
- [ ] `lib/purchases.ts` created

### Task 0.6: Configure Monitoring
**Set up error tracking and analytics**

1. Create Sentry project
2. Create PostHog project
3. Add DSN/keys to `.env`
4. Create `lib/monitoring.ts`

**Acceptance Criteria:**
- [ ] Sentry captures errors
- [ ] PostHog tracks events
- [ ] User identification works

### Task 0.7: Landing Page ✅
- Fresh landing page deployed to Vercel
- Connected to Supabase
- Old v0 repo archived
- Ready for `/api/waitlist` and `/api/cron` endpoints

---

## Phase 1: Content Pipeline

### Task 1.1: USCCB Scraper Function ← CURRENT
**Fetch daily readings from USCCB**

Create function to scrape readings from USCCB website for a given date.

**Acceptance Criteria:**
- [ ] Fetches First Reading text and reference
- [ ] Fetches Gospel text and reference
- [ ] Handles different liturgical calendar variations
- [ ] Returns clean, formatted text

### Task 1.2: Commentary Generation Function
**Generate GPT commentary for readings**

Create function that takes reading text and generates 200-300 word commentary.

**Acceptance Criteria:**
- [ ] Uses GPT-4o
- [ ] Follows tone guidelines (warm, reverent, accessible)
- [ ] Generates for both First Reading and Gospel
- [ ] ~60 seconds when spoken

### Task 1.3: Audio Generation Function
**Generate TTS audio files**

Create function to convert text to speech using OpenAI TTS.

**Acceptance Criteria:**
- [ ] Uses tts-1-hd model with nova voice
- [ ] Generates audio for: readings, commentaries, closing blessing
- [ ] Uploads to Supabase Storage
- [ ] Returns public URLs

### Task 1.4: Daily Content Generation Script
**Orchestrate full daily content pipeline**

Create script that runs all generation functions and saves to database.

**Acceptance Criteria:**
- [ ] Fetches readings
- [ ] Generates all commentary
- [ ] Generates all audio
- [ ] Saves everything to `daily_readings` table
- [ ] Updates `generation_status`

### Task 1.5: Seed Initial Content
**Generate content for testing**

Run the pipeline to generate content for today + next 7 days.

**Acceptance Criteria:**
- [ ] At least 7 days of content in database
- [ ] All audio files accessible
- [ ] Content quality reviewed

### Task 1.6: Create Vercel Cron Endpoint
**Set up automated daily generation**

Create `/api/cron/generate-daily` endpoint in landing page repo.

**Acceptance Criteria:**
- [ ] Endpoint runs full pipeline
- [ ] Configured in `vercel.json` for 2 AM EST
- [ ] Protected with CRON_SECRET
- [ ] Error notifications working

---

## Phase 2: Authentication

### Task 2.1: Auth Context & Provider
**Create auth state management**

**Acceptance Criteria:**
- [ ] AuthContext with user state
- [ ] Session persistence
- [ ] Auto-refresh tokens
- [ ] Loading states

### Task 2.2: Sign Up Screen
**Email/password registration**

**Acceptance Criteria:**
- [ ] Email + password inputs
- [ ] Validation
- [ ] Error handling
- [ ] Redirects to session on success

### Task 2.3: Sign In Screen
**Email/password login**

**Acceptance Criteria:**
- [ ] Email + password inputs
- [ ] "Forgot password" link
- [ ] Error handling
- [ ] Redirects appropriately

### Task 2.4: Forgot Password Flow
**Password reset via email**

**Acceptance Criteria:**
- [ ] Email input screen
- [ ] Sends reset email
- [ ] Deep link handling
- [ ] New password screen

### Task 2.5: User Record Creation Trigger
**Auto-create user in public.users on signup**

**Acceptance Criteria:**
- [ ] Database trigger or function
- [ ] Creates user record with auth_id
- [ ] Sets trial_ends_at

### Task 2.6: Protected Routes
**Redirect unauthenticated users**

**Acceptance Criteria:**
- [ ] Auth check on app load
- [ ] Redirect to sign-in if no session
- [ ] Protect all main app routes

### Task 2.7: OAuth Configuration (Optional)
**Google and Apple Sign In**

**Acceptance Criteria:**
- [ ] Google OAuth working
- [ ] Apple Sign In working
- [ ] User record created for OAuth users

---

## Phase 3: Core Session Flow

### Task 3.1: Audio Player Component
**Reusable audio playback component**

**Acceptance Criteria:**
- [ ] Play/pause controls
- [ ] Loading state
- [ ] Completion callback
- [ ] No scrubbing (intentional)

### Task 3.2: Breathing Exercise Component
**Animated breathing guide**

**Acceptance Criteria:**
- [ ] 4 sec in / 4 sec out animation
- [ ] Calming messages rotate
- [ ] Displays while audio loads

### Task 3.3: Reflection Input Component
**Text input for user reflections**

**Acceptance Criteria:**
- [ ] Large comfortable textarea
- [ ] Reading text visible above
- [ ] Placeholder: "What stood out to you?"
- [ ] Submit button

### Task 3.4: Acknowledgment Display Component
**Shows personalized AI response**

**Acceptance Criteria:**
- [ ] Styled text display
- [ ] Distinct from reading text
- [ ] Loading state while generating

### Task 3.5: Session State Machine
**Manage session flow states**

States: loading → breathing → first_reading → first_commentary → first_reflection → first_acknowledgment → gospel → gospel_commentary → gospel_reflection → gospel_acknowledgment → closing → complete

**Acceptance Criteria:**
- [ ] Clear state transitions
- [ ] Can't skip steps
- [ ] Tracks progress for analytics

### Task 3.6: Fetch Today's Session API
**Get today's readings and audio URLs**

**Acceptance Criteria:**
- [ ] Fetches from `daily_readings` table
- [ ] Creates session record in `sessions` table
- [ ] Returns all content + URLs

### Task 3.7: Submit Reflection API
**Save reflection and get acknowledgment**

**Acceptance Criteria:**
- [ ] Saves reflection to session
- [ ] Calls GPT for acknowledgment
- [ ] Returns acknowledgment text
- [ ] Updates streak on completion

### Task 3.8: Session Screen
**Main reflection experience**

**Acceptance Criteria:**
- [ ] Orchestrates all components
- [ ] Follows state machine
- [ ] Smooth transitions
- [ ] Handles errors gracefully

### Task 3.9: Completion Screen
**Post-session summary**

**Acceptance Criteria:**
- [ ] Shows updated streak
- [ ] Completion calendar
- [ ] "Done" or "View history" CTA

---

## Phase 4: Supporting Screens

### Task 4.1: Home Screen
**Main entry point**

**Acceptance Criteria:**
- [ ] "Begin Today's Reflection" CTA
- [ ] Current streak display
- [ ] Quick access to history

### Task 4.2: History List Screen
**View past reflections**

**Acceptance Criteria:**
- [ ] Reverse chronological list
- [ ] Date, reading refs, preview
- [ ] Tap to expand

### Task 4.3: History Detail Screen
**Full reflection view**

**Acceptance Criteria:**
- [ ] Reading text (collapsible)
- [ ] User's reflection
- [ ] AI acknowledgment
- [ ] Both First Reading and Gospel

### Task 4.4: Profile Screen
**User settings and info**

**Acceptance Criteria:**
- [ ] Email display
- [ ] Subscription status
- [ ] Sign out button
- [ ] Link to manage subscription

### Task 4.5: Streak Calendar Component
**GitHub-style contribution graph**

**Acceptance Criteria:**
- [ ] Shows last 12 weeks
- [ ] Filled squares for completed days
- [ ] Uses primary green color scale

### Task 4.6: Onboarding Screens
**First-time user flow**

**Acceptance Criteria:**
- [ ] 1-2 screens max
- [ ] Explains how it works
- [ ] Can skip
- [ ] Leads to first session

---

## Phase 5: Subscriptions

### Task 5.1: RevenueCat User Identification
**Link RevenueCat to Supabase user**

**Acceptance Criteria:**
- [ ] Identify user on sign in
- [ ] Restore purchases works
- [ ] User ID consistent

### Task 5.2: Paywall Screen
**Subscription purchase UI**

**Acceptance Criteria:**
- [ ] Shows offering
- [ ] Purchase button
- [ ] Restore purchases link
- [ ] Terms/privacy links

### Task 5.3: Subscription Gating
**Enforce trial/subscription limits**

**Acceptance Criteria:**
- [ ] Check subscription status
- [ ] Show paywall when needed
- [ ] Trial period working (7 days)

### Task 5.4: Subscription Status Sync
**Keep Supabase in sync with RevenueCat**

**Acceptance Criteria:**
- [ ] Webhook or listener setup
- [ ] Updates `subscription_status` in users table
- [ ] Handles all states

---

## Phase 6: Polish & Launch

### Task 6.1: Design System Implementation
**Apply design system to all screens**

**Acceptance Criteria:**
- [ ] Colors match spec (liturgical green #2d5a3f)
- [ ] Typography correct (Georgia headings, Inter body)
- [ ] Components follow design guide
- [ ] Dark mode (optional)

### Task 6.2: Loading States
**Never say "Loading..."**

**Acceptance Criteria:**
- [ ] Breathing exercise while loading
- [ ] Skeleton screens where appropriate
- [ ] "Preparing..." not "Loading..."

### Task 6.3: Error Handling
**Graceful error recovery**

**Acceptance Criteria:**
- [ ] Errors don't crash app
- [ ] User sees friendly message
- [ ] Can retry failed operations
- [ ] Network errors handled

### Task 6.4: Analytics Events
**Implement all tracking**

Events: session_started, reflections_submitted, session_completed, session_abandoned, paywall_viewed, purchase_completed, etc.

**Acceptance Criteria:**
- [ ] All events from spec tracked
- [ ] Properties included correctly
- [ ] Events appear in PostHog

### Task 6.5: Push Notifications Setup
**Daily reminder notifications**

**Acceptance Criteria:**
- [ ] Permission request works
- [ ] Daily notification fires
- [ ] Tapping opens session
- [ ] Can be disabled

### Task 6.6: App Store Assets
**Create store listings**

**Acceptance Criteria:**
- [ ] App icon (1024x1024)
- [ ] Screenshots for all sizes
- [ ] Compelling description
- [ ] Privacy policy URL

### Task 6.7: TestFlight / Internal Testing
**Deploy to testers**

**Acceptance Criteria:**
- [ ] iOS build succeeds
- [ ] Android build succeeds
- [ ] TestFlight available
- [ ] Android internal track available

### Task 6.8: Beta Testing
**Get feedback from initial users**

**Acceptance Criteria:**
- [ ] All testers can install
- [ ] Each completes 3+ sessions
- [ ] Feedback collected
- [ ] Critical bugs fixed

### Task 6.9: App Store Submission
**Submit for public release**

**Acceptance Criteria:**
- [ ] iOS app approved
- [ ] Android app approved
- [ ] Apps live in stores
- [ ] Landing page updated with store links

---

## Task Summary

| Phase | Tasks | Completed | Remaining |
|-------|-------|-----------|-----------|
| 0: Setup | 7 | 4 | 3 |
| 1: Content Pipeline | 6 | 0 | 6 |
| 2: Authentication | 7 | 0 | 7 |
| 3: Core Session | 9 | 0 | 9 |
| 4: Supporting Screens | 6 | 0 | 6 |
| 5: Subscriptions | 4 | 0 | 4 |
| 6: Polish & Launch | 9 | 0 | 9 |
| **Total** | **48** | **4** | **44** |

---

## Notes

- All docs are in `/docs` folder
- Supabase is connected via Vercel integration
- Landing page deployed to Vercel (separate repo)
- Expo app repo: `daily-parish-app`
