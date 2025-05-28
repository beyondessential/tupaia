import { matchPath, useLocation } from 'react-router';

import type { TabValue } from './BottomNavigation';
import { ROUTES } from '../../constants';

export function useBottomNavigationActiveTab(): TabValue | null {
  const { pathname } = useLocation();
  if (matchPath(`${ROUTES.SURVEY_SELECT}/*`, pathname)) return 'surveys';
  if (matchPath(`${ROUTES.TASKS}/*`, pathname)) return 'tasks';
  if (matchPath(ROUTES.HOME, pathname)) return 'home';
  return 'more';
}
