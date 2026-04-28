export const ALL_PROJECTS_SCOPE = 'all-projects';
export const SINGLE_PROJECT_SCOPE = 'single-project';

export const SCOPE_QUERY_PARAM = 'scope';

export const isInScope = (item, scope) => item?.scope === scope;

export const filterChildViewsByScope = (childViews, scope) =>
  childViews?.filter(childView => isInScope(childView, scope)) ?? [];

export const buildSectionsFromRoutes = routes => {
  const allProjectsRoutes = routes
    .map(route => ({
      ...route,
      childViews: filterChildViewsByScope(route.childViews, ALL_PROJECTS_SCOPE),
    }))
    .filter(route => route.childViews.length > 0);

  const singleProjectRoutes = routes
    .map(route => ({
      ...route,
      childViews: filterChildViewsByScope(route.childViews, SINGLE_PROJECT_SCOPE),
    }))
    .filter(route => route.childViews.length > 0);

  return { allProjectsRoutes, singleProjectRoutes };
};

export const appendScopeToPath = (path, scope) => {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${SCOPE_QUERY_PARAM}=${scope}`;
};
