import { generatePath, useParams } from 'react-router-dom';
import { useSurvey } from '../../../api';
import { ROUTES } from '../../../constants';

export const useShare = () => {
  const { countryCode, surveyCode } = useParams();
  const { data: survey } = useSurvey(surveyCode);
  const path = generatePath(ROUTES.SURVEY, {
    countryCode: countryCode ?? null,
    surveyCode: surveyCode ?? null,
  });
  const link = `${window.location.origin}${path}`;

  return async () => {
    try {
      await navigator.share({
        title: document.title,
        text: `Tupaia Survey: ${survey?.name}`,
        url: link,
      });
    } catch (err) {
      // Swallow the error
      // Note that closing the share dialog will trigger the catch block
    }
  };
};
