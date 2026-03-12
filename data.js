export const STORAGE_KEY = 'time_capsule_unlocks';

export const YEAR_CHAPTERS = [
  {
    id: 'year-2026',
    key: '2026',
    type: 'year',
    year: 2026,
    title: 'Chapter 2026',
    summary: 'Soft beginnings and bright corners.',
    unlockLabel: 'Unlocked March 9, 2026',
    art: '/vault-k9f3b1a2c7d4e8f6a1b2c3d4/assets/a39f1c2.webp',
    content: [
      'The first pages of this capsule are full of little proofs that this year mattered.',
      'I wanted to save moments that felt small at the time but turned out to be everything.'
    ]
  },
  {
    id: 'year-2027',
    key: '2027',
    type: 'year',
    year: 2027,
    title: 'Chapter 2027',
    summary: 'A second layer of stories.',
    unlockLabel: 'Unlocks March 9, 2027',
    content: ['This chapter is waiting for future memories.']
  },
  {
    id: 'year-2028',
    key: '2028',
    type: 'year',
    year: 2028,
    title: 'Chapter 2028',
    summary: 'Another year, another set of pages.',
    unlockLabel: 'Unlocks March 9, 2028',
    content: ['This chapter is waiting for future memories.']
  },
  {
    id: 'year-2029',
    key: '2029',
    type: 'year',
    year: 2029,
    title: 'Chapter 2029',
    summary: 'The archive keeps growing.',
    unlockLabel: 'Unlocks March 9, 2029',
    content: ['This chapter is waiting for future memories.']
  },
  {
    id: 'year-2030',
    key: '2030',
    type: 'year',
    year: 2030,
    title: 'Chapter 2030',
    summary: 'A full timeline in progress.',
    unlockLabel: 'Unlocks March 9, 2030',
    content: ['This chapter is waiting for future memories.']
  }
];

export const SPECIAL_SECTIONS = [
  {
    id: 'special-bad-day',
    key: 'bad-day-letter',
    type: 'special',
    title: 'Bad Day Letter',
    summary: 'Open on days that feel heavier than usual.',
    unlockLabel: 'Locked',
    content: [
      'If today is rough, read this slowly.',
      'You are not behind. You are not failing. You are carrying more than people can see.'
    ]
  },
  {
    id: 'special-gallery',
    key: 'gallery',
    type: 'special',
    title: 'Gallery',
    summary: 'Snapshots and tiny moments worth keeping.',
    unlockLabel: 'Unlocked',
    defaultUnlocked: true,
    art: '/vault-k9f3b1a2c7d4e8f6a1b2c3d4/assets/f81d0a1.webp',
    content: [
      'A private gallery for favorite photos and little evidence of good days.',
      'This section can keep growing whenever you add new pictures.'
    ]
  },
  {
    id: 'special-playlist',
    key: 'playlist',
    type: 'special',
    title: 'Playlist',
    summary: 'Songs attached to specific chapters of your story.',
    unlockLabel: 'Locked',
    content: ['A future playlist lives here.']
  },
  {
    id: 'special-miss-me',
    key: 'when-you-miss-me',
    type: 'special',
    title: 'When You Miss Me',
    summary: 'A page meant for distance and quiet moments.',
    unlockLabel: 'Locked',
    content: ['A note for the days when distance feels loud.']
  },
  {
    id: 'special-jokes',
    key: 'inside-jokes',
    type: 'special',
    title: 'Inside Jokes',
    summary: 'The lines only the two of you understand.',
    unlockLabel: 'Locked',
    content: ['Reserved for jokes that still make no sense to anyone else.']
  },
  {
    id: 'special-origin',
    key: 'sheep-unicorn-origin',
    type: 'special',
    title: 'The Sheep Unicorn Origin Story',
    summary: 'The canonical version of a legendary bit.',
    unlockLabel: 'Locked',
    content: ['One day this page will explain everything.']
  }
];

export const REDEEM_CODES = {
  BADDAY: ['special-bad-day'],
  PLAYLIST: ['special-playlist'],
  MISSME: ['special-miss-me'],
  JOKES: ['special-jokes'],
  ORIGIN: ['special-origin'],
  BYPASS: ['special-bad-day', 'special-playlist', 'special-miss-me', 'special-jokes', 'special-origin']
};
