import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../api';
import { useI18n } from './I18n';
import { useHomeUrl } from './useHomeUrl';

// Gets the best default dashboard possible, and check if the selected dashboard is valid
export const useDefaultDashboardTab = (selectedDashboard = null, options) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { translate } = useI18n();
  const { homeUrl } = useHomeUrl();
  const { isLoggedIn, isFetching: isFetchingUser } = useUser();
  const defaultDashboardGroup = translate('dashboards.studentEnrolment');
  const schoolDefaultDashboardGroup = 'Students';

  if (!options || options.length === 0) {
    return null;
  }

  const dashboardNames = options.map(d => d.dashboardName);

  if (selectedDashboard) {
    if (dashboardNames.includes(selectedDashboard)) {
      return selectedDashboard;
    }
    if (!isFetchingUser && !isLoggedIn) {
      return navigate(`${homeUrl}/login`, {
        state: {
          referer: location.pathname,
        },
      });
    }
  }

  if (dashboardNames.includes(defaultDashboardGroup)) {
    return defaultDashboardGroup;
  }
  if (dashboardNames.includes(schoolDefaultDashboardGroup)) {
    return schoolDefaultDashboardGroup;
  }
  return dashboardNames[0];
};
