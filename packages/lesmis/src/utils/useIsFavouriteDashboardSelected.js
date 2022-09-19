import { FAVOURITES_DASHBOARD_CODE } from '../constants';
import { useUrlSearchParams } from './useUrlSearchParams';

export const useIsFavouriteDashboardSelected = () => {
  const [{ dashboard: selectedDashboard }] = useUrlSearchParams();
  return selectedDashboard === FAVOURITES_DASHBOARD_CODE;
};
