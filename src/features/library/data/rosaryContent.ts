/**
 * Rosary Content Data
 * All 4 mysteries with decades and scripture snippets
 */

import { RosaryMystery } from '../../../stores/audioStore';

export interface Decade {
  title: string;
  scripture: string;
}

export interface RosaryMysteryData {
  id: RosaryMystery;
  title: string;
  displayTitle: string;
  quote: string;
  quoteAttribution: string;
  duration: string;
  durationMs: number;
  audioUrl: string; // Will be populated from backend/CDN
  decades: Decade[];
}

export const ROSARY_MYSTERIES: RosaryMysteryData[] = [
  {
    id: 'joyful',
    title: 'Joyful Mysteries',
    displayTitle: 'JOYFUL MYSTERIES',
    quote: 'Pray the Rosary every day to obtain peace for the world.',
    quoteAttribution: 'Our Lady of Fatima',
    duration: '~22 min',
    durationMs: 22 * 60 * 1000,
    audioUrl: '', // TODO: Add CDN URL
    decades: [
      {
        title: 'The Annunciation',
        scripture: 'The angel said to her, "Do not be afraid, Mary, for you have found favor with God." — Luke 1:30',
      },
      {
        title: 'The Visitation',
        scripture: 'When Elizabeth heard Mary\'s greeting, the infant leaped in her womb. — Luke 1:41',
      },
      {
        title: 'The Nativity',
        scripture: 'She gave birth to her firstborn son and wrapped him in swaddling clothes. — Luke 2:7',
      },
      {
        title: 'The Presentation',
        scripture: 'When the days were completed for their purification, they took him up to Jerusalem. — Luke 2:22',
      },
      {
        title: 'Finding in the Temple',
        scripture: 'After three days they found him in the temple, sitting among the teachers. — Luke 2:46',
      },
    ],
  },
  {
    id: 'sorrowful',
    title: 'Sorrowful Mysteries',
    displayTitle: 'SORROWFUL MYSTERIES',
    quote: 'He was despised and rejected, a man of suffering and acquainted with grief.',
    quoteAttribution: 'Isaiah 53:3',
    duration: '~21 min',
    durationMs: 21 * 60 * 1000,
    audioUrl: '', // TODO: Add CDN URL
    decades: [
      {
        title: 'The Agony in the Garden',
        scripture: 'He withdrew about a stone\'s throw and knelt down and prayed. — Luke 22:41',
      },
      {
        title: 'The Scourging at the Pillar',
        scripture: 'Then Pilate took Jesus and had him scourged. — John 19:1',
      },
      {
        title: 'The Crowning with Thorns',
        scripture: 'Weaving a crown of thorns, they placed it on his head. — Matthew 27:29',
      },
      {
        title: 'The Carrying of the Cross',
        scripture: 'Carrying the cross himself, he went out to what is called the Place of the Skull. — John 19:17',
      },
      {
        title: 'The Crucifixion',
        scripture: 'When they came to the place called the Skull, they crucified him. — Luke 23:33',
      },
    ],
  },
  {
    id: 'glorious',
    title: 'Glorious Mysteries',
    displayTitle: 'GLORIOUS MYSTERIES',
    quote: 'He is not here; he has risen, just as he said.',
    quoteAttribution: 'Matthew 28:6',
    duration: '~22 min',
    durationMs: 22 * 60 * 1000,
    audioUrl: '', // TODO: Add CDN URL
    decades: [
      {
        title: 'The Resurrection',
        scripture: 'He is not here, for he has been raised just as he said. — Matthew 28:6',
      },
      {
        title: 'The Ascension',
        scripture: 'As they were looking on, he was lifted up, and a cloud took him from their sight. — Acts 1:9',
      },
      {
        title: 'The Descent of the Holy Spirit',
        scripture: 'They were all filled with the Holy Spirit and began to speak in different tongues. — Acts 2:4',
      },
      {
        title: 'The Assumption',
        scripture: 'A great sign appeared in the sky, a woman clothed with the sun. — Revelation 12:1',
      },
      {
        title: 'The Coronation',
        scripture: 'On her head she wore a crown of twelve stars. — Revelation 12:1',
      },
    ],
  },
  {
    id: 'luminous',
    title: 'Luminous Mysteries',
    displayTitle: 'LUMINOUS MYSTERIES',
    quote: 'I am the light of the world. Whoever follows me will not walk in darkness.',
    quoteAttribution: 'John 8:12',
    duration: '~23 min',
    durationMs: 23 * 60 * 1000,
    audioUrl: '', // TODO: Add CDN URL
    decades: [
      {
        title: 'The Baptism of Christ',
        scripture: 'A voice came from the heavens, saying, "This is my beloved Son." — Matthew 3:17',
      },
      {
        title: 'The Wedding at Cana',
        scripture: 'Jesus did this as the beginning of his signs in Cana in Galilee. — John 2:11',
      },
      {
        title: 'The Proclamation of the Kingdom',
        scripture: 'Repent, for the kingdom of heaven is at hand. — Matthew 4:17',
      },
      {
        title: 'The Transfiguration',
        scripture: 'His face shone like the sun and his clothes became white as light. — Matthew 17:2',
      },
      {
        title: 'The Institution of the Eucharist',
        scripture: 'This is my body, which will be given for you; do this in memory of me. — Luke 22:19',
      },
    ],
  },
];

export function getRosaryMystery(id: RosaryMystery): RosaryMysteryData | undefined {
  return ROSARY_MYSTERIES.find(m => m.id === id);
}
