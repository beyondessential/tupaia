import { matchPath, useLocation } from 'react-router';
import { ROUTES } from '../../constants';
import { useIsMobile } from '../../utils';

const bottomNavigationBarBlocklist = [
  `${ROUTES.SURVEY_RESUBMIT}/*`,
  `${ROUTES.SURVEY_SCREEN}/*`,
  ROUTES.ACCOUNT_SETTINGS,
  ROUTES.EXPORT_SURVEY_RESPONSE,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.REPORTS,
  ROUTES.RESET_PASSWORD,
  ROUTES.SYNC,
  ROUTES.TASK_DETAILS,
  ROUTES.VERIFY_EMAIL_RESEND,
  ROUTES.VERIFY_EMAIL,
  ROUTES.WELCOME,
] as const;

export function useBottomNavigationVisibility() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  return isMobile
    ? !bottomNavigationBarBlocklist.some(pathPattern => matchPath(pathPattern, pathname))
    : false;
}
