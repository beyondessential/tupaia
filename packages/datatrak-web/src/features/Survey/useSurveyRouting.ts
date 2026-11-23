import { generatePath, useParams, useMatch, useLocation } from 'react-router';
import { ROUTES } from '../../constants';

export const useSurveyRouting = numberOfScreens => {
  const location = useLocation();
  const isResubmitReview = useMatch(ROUTES.SURVEY_RESUBMIT_REVIEW);
  const isResubmit = useMatch(ROUTES.SURVEY_RESUBMIT_SCREEN) || isResubmitReview;
  const isReview = useMatch(ROUTES.SURVEY_REVIEW) || isResubmitReview;
  const params = useParams();

  const getScreenPath = (screenNumber: number) => {
    if (isResubmit) {
      return {
        ...location,
        pathname: generatePath(ROUTES.SURVEY_RESUBMIT_SCREEN, {
          countryCode: params.countryCode ?? null,
          surveyCode: params.surveyCode ?? null,
          surveyResponseId: params.surveyResponseId ?? null,
          screenNumber: String(screenNumber),
        }),
      };
    }
    return {
      ...location,
      pathname: generatePath(ROUTES.SURVEY_SCREEN, {
        countryCode: params.countryCode ?? null,
        surveyCode: params.surveyCode ?? null,
        screenNumber: String(screenNumber),
      }),
    };
  };

  const getNextPath = () => {
    if (isReview) return null;
    if (params.screenNumber && parseInt(params.screenNumber) === numberOfScreens) {
      const pathname = isResubmit
        ? generatePath(ROUTES.SURVEY_RESUBMIT_REVIEW, {
            countryCode: params.countryCode ?? null,
            surveyCode: params.surveyCode ?? null,
            surveyResponseId: params.surveyResponseId ?? null,
          })
        : generatePath(ROUTES.SURVEY_REVIEW, {
            countryCode: params.countryCode ?? null,
            surveyCode: params.surveyCode ?? null,
          });
      return {
        ...location,
        pathname,
      };
    }
    return getScreenPath(parseInt(params.screenNumber ?? '1') + 1);
  };

  const getPreviousPath = () => {
    if (isReview) return getScreenPath(numberOfScreens);
    if (!params.screenNumber || params.screenNumber === '1')
      return isResubmit
        ? null
        : {
            ...location,
            pathname: generatePath(ROUTES.SURVEY_SELECT),
          };
    return getScreenPath(parseInt(params.screenNumber) - 1);
  };

  return {
    next: getNextPath(),
    back: getPreviousPath(),
    getScreenPath,
  };
};
