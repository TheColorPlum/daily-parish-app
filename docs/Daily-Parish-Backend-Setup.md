# Daily Parish — Backend Setup Guide

## Overview

This document covers everything needed to set up the Daily Parish backend:

1. Database Schema (Supabase)
2. API Routes
3. Cron Jobs (Vercel)
4. Authentication (Clerk)
5. File Storage (Vercel Blob)
6. Environment Variables
7. Third-Party Integrations

---

## 1. Database Schema

Using Supabase (Postgres). Create these tables in order due to foreign key dependencies.

### 1.1 users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  subscription_status VARCHAR(50) DEFAULT 'trial',
  subscription_id VARCHAR(255),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for auth lookups
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- Index for subscription queries
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
```

**subscription_status values:** `trial`, `active`, `cancelled`, `expired`, `past_due`

### 1.2 daily_readings

```sql
CREATE TABLE daily_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  
  -- First Reading
  first_reading_ref VARCHAR(255) NOT NULL,
  first_reading_text TEXT NOT NULL,
  first_reading_commentary TEXT,
  first_reading_audio_url VARCHAR(500),
  first_commentary_audio_url VARCHAR(500),
  
  -- Gospel
  gospel_ref VARCHAR(255) NOT NULL,
  gospel_text TEXT NOT NULL,
  gospel_commentary TEXT,
  gospel_audio_url VARCHAR(500),
  gospel_commentary_audio_url VARCHAR(500),
  
  -- Closing
  closing_audio_url VARCHAR(500),
  
  -- Metadata
  generation_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for daily lookups
CREATE INDEX idx_daily_readings_date ON daily_readings(date);
```

**generation_status values:** `pending`, `fetched`, `commentary_generated`, `audio_generated`, `complete`, `failed`

### 1.3 sessions

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Completion tracking
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  
  -- First Reading
  first_reading_ref VARCHAR(255),
  first_reading_reflection TEXT,
  first_reading_acknowledgment TEXT,
  first_reflection_submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Gospel
  gospel_ref VARCHAR(255),
  gospel_reflection TEXT,
  gospel_acknowledgment TEXT,
  gospel_reflection_submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics
  session_duration_seconds INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One completed session per user per day
  UNIQUE(user_id, date)
);

-- Index for user history queries
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_date ON sessions(date);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, date DESC);
CREATE INDEX idx_sessions_completed ON sessions(user_id, completed);
```

### 1.4 analytics_events

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  event_name VARCHAR(100) NOT NULL,
  event_properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for event queries
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
```

### 1.5 Supabase Row Level Security (RLS)

Enable RLS for user data protection:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (clerk_id = auth.jwt()->>'sub');

-- Sessions belong to users
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
  ));

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
  ));

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
  ));

-- Daily readings are public read
ALTER TABLE daily_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read daily_readings" ON daily_readings
  FOR SELECT USING (true);
```

---

## 2. API Routes

All routes go in `/app/api/` directory (Next.js App Router).

### 2.1 Route Structure

```
app/
├── api/
│   ├── auth/
│   │   └── webhook/
│   │       └── route.ts          # Clerk webhook for user creation
│   │
│   ├── user/
│   │   ├── route.ts              # GET current user, POST create user
│   │   └── streak/
│   │       └── route.ts          # GET/POST streak data
│   │
│   ├── readings/
│   │   ├── today/
│   │   │   └── route.ts          # GET today's readings + audio URLs
│   │   └── [date]/
│   │       └── route.ts          # GET specific date's readings
│   │
│   ├── session/
│   │   ├── route.ts              # POST start session
│   │   ├── reflection/
│   │   │   └── route.ts          # POST submit reflection, get acknowledgment
│   │   └── complete/
│   │       └── route.ts          # POST mark session complete
│   │
│   ├── history/
│   │   └── route.ts              # GET user's reflection history
│   │
│   ├── cron/
│   │   ├── fetch-readings/
│   │   │   └── route.ts          # Cron: fetch daily readings from USCCB
│   │   ├── generate-commentary/
│   │   │   └── route.ts          # Cron: generate GPT commentary
│   │   └── generate-audio/
│   │       └── route.ts          # Cron: generate TTS audio
│   │
│   ├── stripe/
│   │   └── webhook/
│   │       └── route.ts          # Stripe webhook for subscriptions
│   │
│   └── analytics/
│       └── event/
│           └── route.ts          # POST track event
```

### 2.2 Key Route Implementations

#### GET /api/readings/today

```typescript
// app/api/readings/today/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_readings')
    .select('*')
    .eq('date', today)
    .single();
  
  if (error || !data) {
    return NextResponse.json(
      { error: 'Readings not available' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(data);
}
```

#### POST /api/session/reflection

```typescript
// app/api/session/reflection/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { sessionId, readingType, reflection } = await request.json();
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  // Get user's internal ID
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();
  
  // Fetch reflection history (last 20 reflections = 10 sessions)
  const { data: history } = await supabase
    .from('sessions')
    .select('date, first_reading_ref, first_reading_reflection, gospel_ref, gospel_reflection')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('date', { ascending: false })
    .limit(10);
  
  // Get current session with today's readings
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  // Get today's readings for context
  const { data: readings } = await supabase
    .from('daily_readings')
    .select('*')
    .eq('date', session.date)
    .single();
  
  // Format history for prompt
  const formattedHistory = formatReflectionHistory(history);
  
  // Build user message based on reading type
  let userMessage: string;
  
  if (readingType === 'first_reading') {
    userMessage = `TODAY'S FIRST READING: ${readings.first_reading_ref}
${readings.first_reading_text}

USER'S REFLECTION:
${reflection}

---

REFLECTION HISTORY (most recent first):
${formattedHistory}`;
  } else {
    userMessage = `TODAY'S FIRST READING: ${readings.first_reading_ref}
${readings.first_reading_text}

USER'S FIRST READING REFLECTION:
${session.first_reading_reflection}

---

TODAY'S GOSPEL: ${readings.gospel_ref}
${readings.gospel_text}

USER'S GOSPEL REFLECTION:
${reflection}

---

REFLECTION HISTORY (most recent first):
${formattedHistory}`;
  }
  
  // Generate acknowledgment
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const systemPrompt = readingType === 'first_reading' 
    ? FIRST_READING_ACKNOWLEDGMENT_PROMPT 
    : GOSPEL_ACKNOWLEDGMENT_PROMPT;
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 300,
    temperature: 0.7
  });
  
  const acknowledgment = completion.choices[0].message.content;
  
  // Save reflection and acknowledgment
  const updateField = readingType === 'first_reading' 
    ? {
        first_reading_reflection: reflection,
        first_reading_acknowledgment: acknowledgment,
        first_reflection_submitted_at: new Date().toISOString()
      }
    : {
        gospel_reflection: reflection,
        gospel_acknowledgment: acknowledgment,
        gospel_reflection_submitted_at: new Date().toISOString()
      };
  
  await supabase
    .from('sessions')
    .update(updateField)
    .eq('id', sessionId);
  
  return NextResponse.json({ acknowledgment });
}

function formatReflectionHistory(history: any[]) {
  if (!history || history.length === 0) {
    return 'This is the user\'s first session. No history available yet.';
  }
  
  return history.map(session => `
[${session.date}] - ${session.first_reading_ref}
Reading type: First Reading
Reflection: ${session.first_reading_reflection}

[${session.date}] - ${session.gospel_ref}
Reading type: Gospel
Reflection: ${session.gospel_reflection}
`).join('\n---\n');
}

// Import these from your prompts file
const FIRST_READING_ACKNOWLEDGMENT_PROMPT = `...`;
const GOSPEL_ACKNOWLEDGMENT_PROMPT = `...`;
```

#### POST /api/session/complete

```typescript
// app/api/session/complete/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { sessionId } = await request.json();
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();
  
  // Mark session complete
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const { data: session } = await supabase
    .from('sessions')
    .update({
      completed: true,
      completed_at: now.toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();
  
  // Calculate session duration
  const duration = Math.round(
    (new Date(session.completed_at).getTime() - 
     new Date(session.started_at).getTime()) / 1000
  );
  
  await supabase
    .from('sessions')
    .update({ session_duration_seconds: duration })
    .eq('id', sessionId);
  
  // Update streak
  let newStreak = 1;
  
  if (user.last_completed_date) {
    const lastDate = new Date(user.last_completed_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays === 1) {
      // Consecutive day - increment streak
      newStreak = user.current_streak + 1;
    } else if (diffDays === 0) {
      // Same day - keep streak
      newStreak = user.current_streak;
    }
    // else diffDays > 1 - streak resets to 1
  }
  
  const newLongestStreak = Math.max(newStreak, user.longest_streak);
  
  await supabase
    .from('users')
    .update({
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_completed_date: today
    })
    .eq('id', user.id);
  
  return NextResponse.json({
    completed: true,
    streak: newStreak,
    longestStreak: newLongestStreak,
    sessionDuration: duration
  });
}
```

#### GET /api/history

```typescript
// app/api/history/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();
  
  // Get completed sessions with reading text
  const { data: sessions, count } = await supabase
    .from('sessions')
    .select(`
      *,
      daily_readings (
        first_reading_text,
        gospel_text
      )
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);
  
  return NextResponse.json({
    sessions,
    total: count,
    hasMore: offset + limit < (count || 0)
  });
}
```

#### POST /api/session (Start Session)

```typescript
// app/api/session/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  // Get user
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();
  
  const today = new Date().toISOString().split('T')[0];
  
  // Check if session already exists for today
  const { data: existingSession } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();
  
  if (existingSession) {
    return NextResponse.json(existingSession);
  }
  
  // Get today's readings
  const { data: readings } = await supabase
    .from('daily_readings')
    .select('first_reading_ref, gospel_ref')
    .eq('date', today)
    .single();
  
  if (!readings) {
    return NextResponse.json(
      { error: 'Readings not available for today' },
      { status: 404 }
    );
  }
  
  // Create new session
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      date: today,
      first_reading_ref: readings.first_reading_ref,
      gospel_ref: readings.gospel_ref,
      started_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(session);
}
```

---

## 3. Cron Jobs

Using Vercel Cron. Configure in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-readings",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/generate-commentary",
      "schedule": "5 6 * * *"
    },
    {
      "path": "/api/cron/generate-audio",
      "schedule": "15 6 * * *"
    }
  ]
}
```

**Schedule explanation:**
- 6:00 AM UTC (2:00 AM EST) — Fetch readings from USCCB
- 6:05 AM UTC — Generate GPT commentary
- 6:15 AM UTC — Generate TTS audio files

### 3.1 Cron: Fetch Readings

```typescript
// app/api/cron/fetch-readings/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  // Check if already exists
  const { data: existing } = await supabase
    .from('daily_readings')
    .select('id')
    .eq('date', dateStr)
    .single();
  
  if (existing) {
    return NextResponse.json({ message: 'Already fetched' });
  }
  
  // Fetch from USCCB (your existing scraper logic)
  const readings = await fetchUSCCBReadings(dateStr);
  
  // Insert into database
  await supabase
    .from('daily_readings')
    .insert({
      date: dateStr,
      first_reading_ref: readings.firstReading.reference,
      first_reading_text: readings.firstReading.text,
      gospel_ref: readings.gospel.reference,
      gospel_text: readings.gospel.text,
      generation_status: 'fetched'
    });
  
  return NextResponse.json({ success: true, date: dateStr });
}

async function fetchUSCCBReadings(date: string) {
  // Your existing USCCB scraper implementation
  // Returns { firstReading: { reference, text }, gospel: { reference, text } }
}
```

### 3.2 Cron: Generate Commentary

```typescript
// app/api/cron/generate-commentary/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Get readings that need commentary
  const { data: readings } = await supabase
    .from('daily_readings')
    .select('*')
    .eq('generation_status', 'fetched')
    .limit(1)
    .single();
  
  if (!readings) {
    return NextResponse.json({ message: 'No readings to process' });
  }
  
  // Generate First Reading commentary
  const firstCommentary = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: FIRST_READING_COMMENTARY_PROMPT },
      { role: 'user', content: `First Reading: ${readings.first_reading_ref}\n\n${readings.first_reading_text}` }
    ],
    max_tokens: 500,
    temperature: 0.7
  });
  
  // Generate Gospel commentary
  const gospelCommentary = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: GOSPEL_COMMENTARY_PROMPT },
      { role: 'user', content: `Gospel: ${readings.gospel_ref}\n\n${readings.gospel_text}` }
    ],
    max_tokens: 500,
    temperature: 0.7
  });
  
  // Update database
  await supabase
    .from('daily_readings')
    .update({
      first_reading_commentary: firstCommentary.choices[0].message.content,
      gospel_commentary: gospelCommentary.choices[0].message.content,
      generation_status: 'commentary_generated'
    })
    .eq('id', readings.id);
  
  return NextResponse.json({ success: true, date: readings.date });
}

// Import from prompts file
const FIRST_READING_COMMENTARY_PROMPT = `...`;
const GOSPEL_COMMENTARY_PROMPT = `...`;
```

### 3.3 Cron: Generate Audio

```typescript
// app/api/cron/generate-audio/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { put } from '@vercel/blob';
import OpenAI from 'openai';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Get readings that need audio
  const { data: readings } = await supabase
    .from('daily_readings')
    .select('*')
    .eq('generation_status', 'commentary_generated')
    .limit(1)
    .single();
  
  if (!readings) {
    return NextResponse.json({ message: 'No readings to process' });
  }
  
  const dateStr = readings.date;
  
  // Generate all audio files
  const audioFiles = [
    { key: 'first_reading_audio_url', text: readings.first_reading_text, filename: `${dateStr}-first-reading.mp3` },
    { key: 'first_commentary_audio_url', text: readings.first_reading_commentary, filename: `${dateStr}-first-commentary.mp3` },
    { key: 'gospel_audio_url', text: readings.gospel_text, filename: `${dateStr}-gospel.mp3` },
    { key: 'gospel_commentary_audio_url', text: readings.gospel_commentary, filename: `${dateStr}-gospel-commentary.mp3` },
    { key: 'closing_audio_url', text: CLOSING_BLESSING_TEXT, filename: `${dateStr}-closing.mp3` }
  ];
  
  const urls: Record<string, string> = {};
  
  for (const file of audioFiles) {
    // Generate TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'nova',
      input: file.text,
      speed: 0.95
    });
    
    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Upload to Vercel Blob
    const blob = await put(file.filename, buffer, {
      access: 'public',
      contentType: 'audio/mpeg'
    });
    
    urls[file.key] = blob.url;
  }
  
  // Update database with URLs
  await supabase
    .from('daily_readings')
    .update({
      ...urls,
      generation_status: 'complete'
    })
    .eq('id', readings.id);
  
  return NextResponse.json({ success: true, date: dateStr });
}

const CLOSING_BLESSING_TEXT = `Thank you for taking this time to reflect on God's word today. May the insights you've gained guide your thoughts and actions. Go in peace, and may God bless you throughout this day.`;
```

---

## 4. Authentication (Clerk)

### 4.1 Setup

1. Create Clerk account at clerk.com
2. Create new application
3. Enable Email/Password, Google OAuth, Apple Sign In
4. Get API keys

### 4.2 Webhook for User Creation

```typescript
// app/api/auth/webhook/route.ts
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const payload = await request.text();
  const headers = {
    'svix-id': request.headers.get('svix-id')!,
    'svix-timestamp': request.headers.get('svix-timestamp')!,
    'svix-signature': request.headers.get('svix-signature')!,
  };
  
  // Verify webhook
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let event;
  
  try {
    event = wh.verify(payload, headers);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  if (event.type === 'user.created') {
    const { id, email_addresses } = event.data;
    const email = email_addresses[0]?.email_address;
    
    // Calculate trial end (7 days)
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 7);
    
    await supabase.from('users').insert({
      clerk_id: id,
      email: email,
      subscription_status: 'trial',
      trial_ends_at: trialEnds.toISOString()
    });
  }
  
  if (event.type === 'user.deleted') {
    const { id } = event.data;
    
    await supabase
      .from('users')
      .delete()
      .eq('clerk_id', id);
  }
  
  return NextResponse.json({ received: true });
}
```

### 4.3 Middleware

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/cron/(.*)',
    '/api/auth/webhook',
    '/api/stripe/webhook'
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

---

## 5. File Storage (Vercel Blob)

### 5.1 Setup

1. In Vercel dashboard, go to Storage
2. Create new Blob store
3. Connect to your project
4. Token is automatically available as `BLOB_READ_WRITE_TOKEN`

### 5.2 File Organization

```
daily-parish-audio/
├── 2024-11-18-first-reading.mp3
├── 2024-11-18-first-commentary.mp3
├── 2024-11-18-gospel.mp3
├── 2024-11-18-gospel-commentary.mp3
├── 2024-11-18-closing.mp3
├── 2024-11-19-first-reading.mp3
...
```

### 5.3 Cleanup Job (Optional)

Delete audio files older than 7 days to manage storage costs:

```typescript
// app/api/cron/cleanup-audio/route.ts
import { NextResponse } from 'next/server';
import { del, list } from '@vercel/blob';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { blobs } = await list();
  
  let deletedCount = 0;
  for (const blob of blobs) {
    if (new Date(blob.uploadedAt) < sevenDaysAgo) {
      await del(blob.url);
      deletedCount++;
    }
  }
  
  return NextResponse.json({ deleted: deletedCount });
}
```

Add to `vercel.json`:
```json
{
  "path": "/api/cron/cleanup-audio",
  "schedule": "0 7 * * *"
}
```

---

## 6. Environment Variables

### 6.1 Required Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...  # For server-side operations

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# Vercel Blob (auto-populated when you create store)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Cron Security
CRON_SECRET=your-random-secret-string

# Analytics (if using PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 6.2 Local Development

Create `.env.local`:

```bash
# Copy all the above variables
# Use test/development keys where available
```

---

## 7. Third-Party Integrations

### 7.1 Stripe (Payments)

#### Products to Create

1. **Daily Parish Monthly** — $4.99/month
2. **Daily Parish Annual** — $39.99/year (save ~33%)

#### Webhook Events to Handle

```typescript
// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerk_user_id;
      
      await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_id: session.subscription as string
        })
        .eq('clerk_id', clerkUserId);
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      await supabase
        .from('users')
        .update({ subscription_status: 'cancelled' })
        .eq('subscription_id', subscription.id);
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      
      await supabase
        .from('users')
        .update({ subscription_status: 'past_due' })
        .eq('subscription_id', invoice.subscription as string);
      break;
    }
  }
  
  return NextResponse.json({ received: true });
}
```

### 7.2 PostHog (Analytics)

```typescript
// lib/analytics.ts
import posthog from 'posthog-js';

// Initialize (call once in app)
export function initAnalytics() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.opt_out_capturing();
        }
      }
    });
  }
}

// Track events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  posthog.capture(eventName, properties);
}

// Identify user
export function identifyUser(userId: string, traits?: Record<string, any>) {
  posthog.identify(userId, traits);
}

// Usage examples:
// trackEvent('session_started');
// trackEvent('reflection_submitted', { readingType: 'gospel', length: 150 });
// trackEvent('session_completed', { duration: 600, streak: 5 });
```

---

## 8. Deployment Checklist

### Before First Deploy

- [ ] Supabase project created
- [ ] All tables created with RLS policies
- [ ] Clerk application created
- [ ] Clerk webhook endpoint configured (your-app.vercel.app/api/auth/webhook)
- [ ] OpenAI API key obtained
- [ ] Vercel Blob store created
- [ ] All environment variables set in Vercel
- [ ] Stripe products created
- [ ] Stripe webhook endpoint configured (your-app.vercel.app/api/stripe/webhook)

### After Deploy

- [ ] Test Clerk webhook (create test user, verify in Supabase)
- [ ] Test cron jobs manually:
  ```bash
  curl https://your-app.vercel.app/api/cron/fetch-readings \
    -H "Authorization: Bearer your-cron-secret"
  ```
- [ ] Verify audio files appear in Blob storage
- [ ] Test full session flow end-to-end
- [ ] Verify streak calculation works correctly
- [ ] Test Stripe checkout flow (use test mode)
- [ ] Verify analytics events firing

---

## 9. Local Development

### 9.1 Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# For webhook testing, use ngrok
ngrok http 3000
# Then update Clerk/Stripe webhook URLs to ngrok URL
```

### 9.2 Testing Cron Jobs Locally

```bash
# Call cron endpoints directly
curl http://localhost:3000/api/cron/fetch-readings \
  -H "Authorization: Bearer your-cron-secret"
```

### 9.3 Seeding Test Data

```sql
-- Insert test reading for today
INSERT INTO daily_readings (
  date,
  first_reading_ref,
  first_reading_text,
  first_reading_commentary,
  gospel_ref,
  gospel_text,
  gospel_commentary,
  generation_status
) VALUES (
  CURRENT_DATE,
  'Isaiah 55:10-11',
  'Thus says the LORD: Just as from the heavens the rain and snow come down...',
  'This beautiful passage from Isaiah uses the image of rain...',
  'Matthew 6:7-15',
  'Jesus said to his disciples: "In praying, do not babble like the pagans..."',
  'In this passage, Jesus teaches his disciples how to pray...',
  'commentary_generated'
);
```

---

## Version History

- v1.0 — Initial backend setup documentation
