export const isProjectSent = (project) => Boolean(project?.formState?.sentToManagement);

export const isProjectPublished = (project) => Boolean(project?.formState?.liveSync?.syncedAt);

export const isProjectInSearch = (project, searchQuery) => (
  String(project?.name || '')
    .toLowerCase()
    .includes(String(searchQuery || '').trim().toLowerCase())
);

export const findMatchingLiveProject = (project, liveProjects) => {
  const storedLiveProjectId = Number(project?.formState?.liveSync?.liveProjectId);

  return (
    liveProjects.find((item) => (
      Number.isFinite(storedLiveProjectId) &&
      storedLiveProjectId > 0 &&
      Number(item?.id) === storedLiveProjectId
    )) ||
    liveProjects.find((item) => (
      String(item?.name || '').trim() === String(project?.name || '').trim() &&
      String(item?.startDate || '') === String(project?.startDate || '') &&
      String(item?.plats || '').trim() === String(project?.plats || '').trim()
    )) ||
    null
  );
};

export const hasLiveMatchChangedSinceReview = (matchingLiveProject, reviewedLiveProjectId) => {
  if (reviewedLiveProjectId === undefined) return false;

  return Number(matchingLiveProject?.id || 0) !== Number(reviewedLiveProjectId || 0);
};

export const buildBulkLiveReview = (projects, searchQuery, liveProjects) => (
  projects
    .filter((project) => Boolean(project?.visibleToTsm))
    .map((project) => {
      const matchingLiveProject = findMatchingLiveProject(project, liveProjects);

      return {
        project,
        projectId: project.id,
        selected: true,
        sentToManagement: isProjectSent(project),
        inCurrentSearch: isProjectInSearch(project, searchQuery),
        publishedLocally: isProjectPublished(project),
        matchingLiveProjectId: matchingLiveProject?.id || null,
        willOverwrite: Boolean(matchingLiveProject?.id),
      };
    })
);
