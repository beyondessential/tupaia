import { useLocation } from 'react-router';

import type { TabValue } from './BottomNavigation';
import { ROUTES } from '../../constants';

export function useBottomNavigationActiveTab(): TabValue | null {
  const { pathname } = useLocation();
  if (pathname.startsWith(ROUTES.SURVEY_SELECT)) return 'surveys';
  if (pathname.startsWith(ROUTES.TASKS)) return 'tasks';
  if (pathname.startsWith(ROUTES.HOME)) return 'home';
  return 'more';
}
