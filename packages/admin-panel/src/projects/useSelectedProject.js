import { useLocation } from 'react-router-dom';
import { useProjects, useUser } from '../api/queries';

export const PROJECT_CODE_PARAM = 'projectCode';

// First path segments that are NOT a project code. Anything else in the first
// segment is treated as a project code. Keep in sync with top-level routes in
// routes/routes.jsx, profileRoutes.jsx and AUTH_ROUTES.
const NON_PROJECT_PREFIXES = new Set([
  'login',
  'forgot-password',
  'reset-password',
  'profile',
  'viz-builder',
  'surveys',
  'users',
  'projects',
  'entities',
  'visualisations',
  'external-database-connections',
]);

const parseProjectCode = pathname => {
  if (!pathname) return null;
  const first = pathname.split('/')[1];
  if (!first || NON_PROJECT_PREFIXES.has(first)) return null;
  return first;
};

// Sync read for axios/fetch interceptors that run outside React.
export const readSelectedProjectCode = () => {
  if (typeof window === 'undefined') return null;
  return parseProjectCode(window.location.pathname);
};

export const useSelectedProjectCode = () => parseProjectCode(useLocation().pathname);

export const useSelectedProject = () => {
  const code = useSelectedProjectCode();
  const { data: projects } = useProjects();
  if (!code || !projects) return null;
  return projects.find(p => p.code === code) ?? null;
};

/**
 * Resolves the project code the sidebar should treat as "active". Differs from
 * useSelectedProjectCode() in that it falls back beyond the URL:
 *   1. URL segment (matches request-scoping behaviour)
 *   2. user.preferences.project_id (last project the user explicitly picked)
 *   3. First project alphabetically (useProjects sorts by name)
 * This keeps the Single-Project nav populated on All Data routes where the URL
 * has no project segment, without changing request scoping (the axios
 * interceptor still parses the URL only — All Data routes stay unscoped).
 */
export const useSidebarProjectCode = () => {
  const urlCode = useSelectedProjectCode();
  const { data: user } = useUser();
  const { data: projects } = useProjects();

  if (urlCode) return urlCode;
  if (!projects || projects.length === 0) return null;

  const preferredId = user?.preferences?.project_id ?? null;
  const preferred = preferredId ? projects.find(p => p.id === preferredId) : null;
  return preferred?.code ?? projects[0]?.code ?? null;
};
