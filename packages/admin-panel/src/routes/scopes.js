export const ALL_PROJECTS_SCOPE = 'all-projects';
export const SINGLE_PROJECT_SCOPE = 'single-project';

// All-data routes mount at the root, e.g. /surveys/questions.
export const ALL_DATA_BASE_PATH = '';

// Single-project routes are nested under a project-code segment, e.g.
// /fanafana/surveys/survey-responses. The route definitions use the literal
// React Router param; nav links substitute the active project code.
export const SINGLE_PROJECT_PATH_PARAM = 'projectCode';
export const SINGLE_PROJECT_ROUTE_BASE = `/:${SINGLE_PROJECT_PATH_PARAM}`;

export const buildSingleProjectBasePath = projectCode =>
  projectCode ? `/${projectCode}` : '';

// Sidebar order: Single project on top, All data on bottom (per design).
export const SECTIONS = [
  {
    id: 'single-project',
    label: 'Single project',
    scope: SINGLE_PROJECT_SCOPE,
  },
  {
    id: 'all-data',
    label: 'All data',
    scope: ALL_PROJECTS_SCOPE,
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
