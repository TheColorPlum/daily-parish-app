/**
 * Examen Content Data
 * Three distinct versions: Standard (12 min), Short (5 min), Emotions (10 min)
 */

import { ExamenVersion } from '../../../stores/audioStore';

// Audio files hosted on Vercel Blob
const AUDIO_BASE_URL = 'https://votive-audio.public.blob.vercel-storage.com';

function getAudioUrl(version: ExamenVersion): string {
  return `${AUDIO_BASE_URL}/examen-${version}.mp3`;
}

export interface ExamenStep {
  title: string;
  description: string;
}

export interface ExamenVersionData {
  id: ExamenVersion;
  title: string;
  displayTitle: string;
  duration: string;
  durationMs: number;
  audioUrl: string;
  description: string;
  steps: ExamenStep[];
}

export const EXAMEN_VERSIONS: ExamenVersionData[] = [
  {
    id: 'standard',
    title: 'Standard Examen',
    displayTitle: 'STANDARD',
    duration: '12 min',
    durationMs: 12 * 60 * 1000,
    audioUrl: getAudioUrl('standard'),
    description: 'The classic Ignatian Examen — a daily practice of reviewing your day with gratitude and seeking God\'s presence in ordinary moments.',
    steps: [
      {
        title: 'Become Present',
        description: 'Quiet yourself. Become aware that you are in God\'s presence. Ask the Holy Spirit to guide this time of prayer.',
      },
      {
        title: 'Review with Gratitude',
        description: 'Walk through your day from morning until now. What are you grateful for? Big or small, name the gifts.',
      },
      {
        title: 'Notice Your Emotions',
        description: 'As you review the day, notice the feelings that arise. Where did you feel alive? Where did you feel drained?',
      },
      {
        title: 'Choose One Moment',
        description: 'Select one moment that stands out — positive or negative. Pray about it. What is God saying to you through it?',
      },
      {
        title: 'Look Toward Tomorrow',
        description: 'Ask God for what you need for tomorrow. Conclude with the Our Father or a prayer of your choosing.',
      },
    ],
  },
  {
    id: 'short',
    title: 'Short Examen',
    displayTitle: 'SHORT',
    duration: '5 min',
    durationMs: 5 * 60 * 1000,
    audioUrl: getAudioUrl('short'),
    description: 'A condensed version for busy days. Three simple questions to connect with God in any moment.',
    steps: [
      {
        title: 'Pause',
        description: 'Take a breath. God is here, right now, with you.',
      },
      {
        title: 'One Gift',
        description: 'What is one thing you\'re grateful for today? Thank God for it.',
      },
      {
        title: 'One Need',
        description: 'What do you need from God right now? Ask simply and trust.',
      },
    ],
  },
  {
    id: 'emotions',
    title: 'Emotions Examen',
    displayTitle: 'EMOTIONS',
    duration: '10 min',
    durationMs: 10 * 60 * 1000,
    audioUrl: getAudioUrl('emotions'),
    description: 'An Examen focused on emotional awareness. Learn to recognize God\'s voice in your feelings and find healing through honest prayer.',
    steps: [
      {
        title: 'Settle',
        description: 'Close your eyes. Place your hand on your heart. Breathe slowly. Ask God to be present to your emotions.',
      },
      {
        title: 'Name the Feeling',
        description: 'What is the strongest emotion you\'ve felt today? Anger? Joy? Anxiety? Sadness? Name it without judgment.',
      },
      {
        title: 'Trace Its Source',
        description: 'When did this feeling begin? What triggered it? Explore the memory gently with God beside you.',
      },
      {
        title: 'Speak to God',
        description: 'Tell God exactly how you feel. No filter, no performance. Let the emotion become a prayer.',
      },
      {
        title: 'Receive',
        description: 'Sit in silence. What does God want to say to you about this feeling? Listen for peace, not answers.',
      },
    ],
  },
];

export function getExamenVersion(id: ExamenVersion): ExamenVersionData | undefined {
  return EXAMEN_VERSIONS.find(v => v.id === id);
}
