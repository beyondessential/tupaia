export const ALL_PROJECTS_SCOPE = 'all-projects';
export const SINGLE_PROJECT_SCOPE = 'single-project';

export const isInScope = (item, scope) => item?.scope === scope;

const hasAnyChildInScope = (route, scope) =>
  route.childViews?.some(childView => isInScope(childView, scope)) ?? false;

// Builds two grouped lists of top-level routes for the sidebar. A route appears
// in a section if it has at least one childView tagged with that scope. The same
// route may appear in both sections — clicking either link goes to the same
// page; data filtering is the server's job.
export const buildSectionsFromRoutes = routes => ({
  allProjectsRoutes: routes.filter(route => hasAnyChildInScope(route, ALL_PROJECTS_SCOPE)),
  singleProjectRoutes: routes.filter(route => hasAnyChildInScope(route, SINGLE_PROJECT_SCOPE)),
});
