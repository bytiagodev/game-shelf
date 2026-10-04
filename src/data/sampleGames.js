// Fictional games and notes for trying the interface. None are Steam history.
const createSampleGame = (id, title, genre, date, hours, color, ink, motif, note) => ({
  id, title, genres: [genre], year: 2026,
  lastPlayed: { date, precision: 'month' },
  steamAppId: null, totalHours: hours, coverUrl: null,
  color, ink, motif,
  notes: note ? [{ date, text: note }] : [],
});

export const sampleGames = [
  createSampleGame('moss-moon', 'Moss & Moon', 'Adventure', '2026-09-01', 18, '#8ed6c0', '#253c32', 'moon',
    'I kept taking the long route. The quiet little corners were my favourite part.'),
  createSampleGame('paper-trails', 'Paper Trails', 'Puzzle', '2026-08-01', 7, '#f4c861', '#483b25', 'steps',
    'A good game for a slow evening. That last puzzle stayed with me for a while.'),
  createSampleGame('low-tide', 'Low Tide', 'Exploration', '2026-07-01', 12, '#7abecf', '#243f4b', 'orbit',
    'Headphones on, lights low. I would happily get lost here again.'),
  createSampleGame('little-orbit', 'Little Orbit', 'Puzzle', '2026-06-01', 4, '#bca0e4', '#353348', 'orbit', null),
  createSampleGame('long-way-home', 'The Long Way Home', 'Adventure', '2026-05-01', 23, '#ff9961', '#472c27', 'steps',
    'The ending felt earned. Glad I took my time with this one.'),
  createSampleGame('after-hours', 'After Hours', 'Simulation', '2026-04-01', 9, '#22232c', '#fffaf3', 'moon', null),
  createSampleGame('cinder', 'Cinder', 'Action', '2026-03-01', 16, '#d93640', '#fffaf3', 'steps', null),
  createSampleGame('soft-static', 'Soft Static', 'Exploration', '2026-03-01', 6, '#f8f8f0', '#343e48', 'orbit', null),
  createSampleGame('last-light', 'Last Light', 'Adventure', '2026-02-01', 11, '#e3d1a1', '#433d2a', 'moon', null),
  createSampleGame('tiny-station', 'Tiny Station', 'Simulation', '2026-01-01', 14, '#2e8653', '#fffaf3', 'steps', null),
];
