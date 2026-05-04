export const ALL_PROJECTS_SCOPE = 'all-projects';
export const SINGLE_PROJECT_SCOPE = 'single-project';

export const ALL_DATA_BASE_PATH = '/all-data';
export const SINGLE_PROJECT_BASE_PATH = '/project';

export const SECTIONS = [
  {
    id: 'all-data',
    label: 'All data',
    scope: ALL_PROJECTS_SCOPE,
    basePath: ALL_DATA_BASE_PATH,
  },
  {
    id: 'single-project',
    label: 'Single project',
    scope: SINGLE_PROJECT_SCOPE,
    basePath: SINGLE_PROJECT_BASE_PATH,
  },
];

export const isInScope = (item, scope) => item?.scope === scope;

// Returns top-level routes whose childViews include items in the given scope,
// with childViews filtered to that scope only. Top-level routes that end up
// with no childViews in scope are dropped.
export const filterRoutesByScope = (routes, scope) =>
  routes
    .map(route => ({
      ...route,
      childViews: route.childViews?.filter(c => isInScope(c, scope)) ?? [],
    }))
    .filter(route => route.childViews.length > 0);
