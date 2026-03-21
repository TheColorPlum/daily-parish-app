/**
 * Examen Content Data
 * Three versions: Standard (12 min), Short, Emotions
 */

import { ExamenVersion } from '../../../stores/audioStore';

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
  audioUrl: string; // Will be populated from backend/CDN
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
    audioUrl: '', // TODO: Add CDN URL
    description: 'The Examen is a daily spiritual practice of reviewing your day with gratitude and seeking God\'s presence in ordinary moments.',
    steps: [
      {
        title: 'Presence',
        description: 'Become aware of God\'s presence with you now.',
      },
      {
        title: 'Gratitude',
        description: 'Give thanks for the day\'s gifts.',
      },
      {
        title: 'Review',
        description: 'Walk through the day\'s events.',
      },
      {
        title: 'Response',
        description: 'Notice your emotions, ask for forgiveness.',
      },
      {
        title: 'Resolve',
        description: 'Look toward tomorrow.',
      },
    ],
  },
  {
    id: 'short',
    title: 'Short Examen',
    displayTitle: 'SHORT',
    duration: '5 min',
    durationMs: 5 * 60 * 1000,
    audioUrl: '', // TODO: Add CDN URL
    description: 'A brief version of the Examen for when time is limited but presence is still desired.',
    steps: [
      {
        title: 'Presence',
        description: 'Become aware of God\'s presence with you now.',
      },
      {
        title: 'Gratitude',
        description: 'Give thanks for the day\'s gifts.',
      },
      {
        title: 'Review',
        description: 'Walk through the day\'s events.',
      },
      {
        title: 'Response',
        description: 'Notice your emotions, ask for forgiveness.',
      },
      {
        title: 'Resolve',
        description: 'Look toward tomorrow.',
      },
    ],
  },
  {
    id: 'emotions',
    title: 'Emotions Examen',
    displayTitle: 'EMOTIONS',
    duration: '10 min',
    durationMs: 10 * 60 * 1000,
    audioUrl: '', // TODO: Add CDN URL
    description: 'A version focused on emotional awareness and processing feelings through a prayerful lens.',
    steps: [
      {
        title: 'Presence',
        description: 'Become aware of God\'s presence with you now.',
      },
      {
        title: 'Gratitude',
        description: 'Give thanks for the day\'s gifts.',
      },
      {
        title: 'Review',
        description: 'Walk through the day\'s events.',
      },
      {
        title: 'Response',
        description: 'Notice your emotions, ask for forgiveness.',
      },
      {
        title: 'Resolve',
        description: 'Look toward tomorrow.',
      },
    ],
  },
];

export function getExamenVersion(id: ExamenVersion): ExamenVersionData | undefined {
  return EXAMEN_VERSIONS.find(v => v.id === id);
}
