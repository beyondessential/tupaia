import { useMatch } from 'react-router-dom';
import { ROUTES } from '../../constants';

export function useIsResubmit() {
  return !!useMatch(`${ROUTES.SURVEY_RESUBMIT}/*`);
}

export function useIsReviewScreen() {
  const isInitialSubmitReviewScreen = !!useMatch(ROUTES.SURVEY_REVIEW);
  const isResubmitReviewScreen = !!useMatch(ROUTES.SURVEY_RESUBMIT_REVIEW);
  return isInitialSubmitReviewScreen || isResubmitReviewScreen;
}

export function useIsSuccessScreen() {
  const isInitialSubmitSuccessScreen = !!useMatch(ROUTES.SURVEY_SUCCESS);
  const isResubmitSuccessScreen = !!useMatch(ROUTES.SURVEY_RESUBMIT_SUCCESS);
  return isInitialSubmitSuccessScreen || isResubmitSuccessScreen;
}
