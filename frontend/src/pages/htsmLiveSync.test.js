import {
  buildBulkLiveReview,
  findMatchingLiveProject,
  hasLiveMatchChangedSinceReview,
  isProjectInSearch,
} from './htsmLiveSync';

const syntheticProjects = [
  {
    id: 1,
    name: 'Aktivt projekt',
    startDate: '2026-11-01',
    plats: 'Lund',
    visibleToTsm: true,
    formState: {},
  },
  {
    id: 2,
    name: 'Skickat projekt',
    startDate: '2026-11-02',
    plats: 'Malmö',
    visibleToTsm: true,
    formState: {
      sentToManagement: true,
      liveSync: {
        liveProjectId: 202,
        syncedAt: '2026-10-20T10:00:00.000Z',
      },
    },
  },
  {
    id: 3,
    name: 'Utanför sökningen',
    startDate: '2026-11-03',
    plats: 'Helsingborg',
    visibleToTsm: true,
    formState: {},
  },
  {
    id: 4,
    name: 'Inte markerat',
    startDate: '2026-11-04',
    plats: 'Eslöv',
    visibleToTsm: false,
    formState: {},
  },
];

const syntheticLiveProjects = [
  { id: 202, name: 'Annat namn', startDate: '2026-01-01', plats: 'Annan plats' },
  { id: 303, name: 'Utanför sökningen', startDate: '2026-11-03', plats: 'Helsingborg' },
];

test('bygger en granskning för alla TSM-markerade projekt oavsett sökfilter och skickat-status', () => {
  const review = buildBulkLiveReview(syntheticProjects, 'projekt', syntheticLiveProjects);

  expect(review).toHaveLength(3);
  expect(review.map((item) => item.projectId)).toEqual([1, 2, 3]);
  expect(review.every((item) => item.selected)).toBe(true);

  expect(review[0]).toMatchObject({
    sentToManagement: false,
    inCurrentSearch: true,
    willOverwrite: false,
  });
  expect(review[1]).toMatchObject({
    sentToManagement: true,
    inCurrentSearch: true,
    publishedLocally: true,
    matchingLiveProjectId: 202,
    willOverwrite: true,
  });
  expect(review[2]).toMatchObject({
    sentToManagement: false,
    inCurrentSearch: false,
    matchingLiveProjectId: 303,
    willOverwrite: true,
  });
});

test('matchar en befintlig liveversion via sparat live-id före projektnamn', () => {
  const match = findMatchingLiveProject(syntheticProjects[1], syntheticLiveProjects);
  expect(match.id).toBe(202);
});

test('matchar en befintlig liveversion via namn, startdatum och plats utan sparat live-id', () => {
  const match = findMatchingLiveProject(syntheticProjects[2], syntheticLiveProjects);
  expect(match.id).toBe(303);
});

test('sökningen är skiftlägesokänslig och hanterar projekt utan namn', () => {
  expect(isProjectInSearch({ name: 'Helsingborg C' }, 'helsingBORG')).toBe(true);
  expect(isProjectInSearch({}, 'Helsingborg')).toBe(false);
});

test('stoppar publicering om live-matchningen har ändrats efter granskningen', () => {
  expect(hasLiveMatchChangedSinceReview({ id: 303 }, null)).toBe(true);
  expect(hasLiveMatchChangedSinceReview({ id: 303 }, 303)).toBe(false);
  expect(hasLiveMatchChangedSinceReview(null, 303)).toBe(true);
  expect(hasLiveMatchChangedSinceReview({ id: 303 }, undefined)).toBe(false);
});
