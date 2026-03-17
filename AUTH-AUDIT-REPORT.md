# Auth Audit Report - 2025-02-23

## Executive Summary

**Root Cause Identified:** Missing `.env` file with Clerk publishable key.

The mobile app had no actual Clerk publishable key configured. The `.env.example` file contained a placeholder value, but no `.env` file existed with the real key. This caused:

1. **"Couldn't find your account"** — Clerk SDK received empty/invalid publishable key
2. **401 errors from API** — Tokens couldn't be generated without proper Clerk config
3. **Infinite 401 loop** — App didn't sign users out on 401, kept retrying with invalid token

## Issues Found & Fixed

### 1. Missing Clerk Configuration (CRITICAL)
- **File:** `.env` (missing)
- **Issue:** No environment file with the actual Clerk publishable key
- **Fix:** Created `.env` with correct key: `pk_test_Y2xvc2luZy1za3Vuay04OC5jbGVyay5hY2NvdW50cy5kZXYk`
- **Clerk Instance:** `closing-skunk-88.clerk.accounts.dev`

### 2. No Debug Logging for Clerk Config
- **File:** `App.tsx`
- **Issue:** No way to verify if key was loaded
- **Fix:** Added startup logging (redacted for security)
```tsx
if (__DEV__) {
  console.log('[Clerk] Publishable key configured:', key ? `${key.substring(0, 15)}...` : 'MISSING');
}
```

### 3. Missing 401 Handling in useUserLoader
- **File:** `src/hooks/useUserLoader.ts`
- **Issue:** 401 errors were logged but didn't trigger sign-out
- **Fix:** Added proper handling that clears user state and signs out:
```tsx
if (error instanceof ApiError && error.status === 401) {
  clearUser();
  await signOut();
}
```

### 4. Missing 401 Handling in TodayScreen
- **File:** `src/screens/TodayScreen.tsx`
- **Issue:** 401 just showed error message, no sign-out
- **Fix:** Added proper handling that clears state and signs out

### 5. Insufficient Auth Flow Logging
- **File:** `src/screens/WelcomeScreen.tsx`
- **Issue:** Errors weren't logged with enough detail for debugging
- **Fix:** Added detailed logging for sign-in, sign-up, and verification flows

## Architecture Review

### Mobile App Auth Flow (Clerk Expo)
```
App.tsx
  └── ClerkProvider (publishable key + token cache)
        └── AppNavigator
              └── isSignedIn ? MainNavigator : AuthNavigator
                                                └── WelcomeScreen
                                                      ├── signUp.create()
                                                      ├── prepareEmailAddressVerification()
                                                      ├── attemptEmailAddressVerification()
                                                      ├── setSignUpActive()
                                                      └── signIn.create() + setSignInActive()
```

### Token Flow
```
1. User signs in via Clerk
2. Clerk stores session in SecureStore (tokenCache)
3. App calls getToken() → Clerk returns JWT
4. JWT sent in Authorization header to API
5. API validates JWT via Clerk middleware
```

### Backend Auth Flow (Next.js + Clerk)
```
middleware.ts
  └── clerkMiddleware()
        └── auth.protect() or return 401

/api/* routes
  └── auth() → { userId }
        └── ensureUserExists(userId) → creates in Supabase if needed
```

## Backend Configuration

The backend is properly configured:
- ✅ `clerkMiddleware` in middleware.ts
- ✅ `auth()` used in all protected routes
- ✅ `ensureUserExists()` creates users on first API call
- ✅ Proper 401 JSON responses for API routes

**Required Vercel Environment Variables:**
- `CLERK_SECRET_KEY` — Must be from same Clerk instance as app's publishable key
- `CLERK_WEBHOOK_SECRET` — For user creation webhook (optional, ensureUserExists is fallback)

## Testing Checklist

Before pushing, verify:

- [ ] `.env` file exists with correct key
- [ ] App starts and logs `[Clerk] Publishable key configured: pk_test_Y2xvc2luZ...`
- [ ] Sign up flow: Create account → Receive verification email → Enter code → Logged in
- [ ] Sign in flow: Enter existing credentials → Logged in
- [ ] Token flow: Readings load successfully (no 401)
- [ ] 401 recovery: If 401 occurs, app signs out and shows sign-in screen

## Files Changed

| File | Change |
|------|--------|
| `.env` | Created with Clerk key |
| `.env.example` | Added documentation |
| `App.tsx` | Added debug logging |
| `src/hooks/useUserLoader.ts` | Added 401 handling + logging |
| `src/screens/TodayScreen.tsx` | Added 401 handling |
| `src/screens/WelcomeScreen.tsx` | Added detailed auth logging |

## Commit

```
fix(auth): Add proper Clerk configuration and 401 handling
```

---

**Status:** Code changes committed, ready for testing. Do NOT push until Pelumi verifies the auth flow works end-to-end.
