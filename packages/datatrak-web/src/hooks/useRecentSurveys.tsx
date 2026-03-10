import { useEffect, useState } from 'react';

import {
  RecentSurvey,
  addRecentSurvey,
  getRecentSurveys,
  getRecentSurveysForCountry,
} from '../utils/surveyHistory';

export const useRecentSurveys = (countryCode?: string) => {
  const [recentSurveys, setRecentSurveys] = useState<RecentSurvey[]>([]);

  useEffect(() => {
    if (countryCode) {
      setRecentSurveys(getRecentSurveysForCountry(countryCode));
    } else {
      setRecentSurveys(getRecentSurveys());
    }
  }, []);

  const trackSurveyVisit = (survey: Omit<RecentSurvey, 'visitedAt'>) => {
    addRecentSurvey(survey);
    setRecentSurveys(getRecentSurveys());
  };

  return { recentSurveys, trackSurveyVisit };
};
