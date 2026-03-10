const RECENT_SURVEYS_KEY = 'recentSurveys';
const MAX_RECENT_SURVEYS = 5;

export interface RecentSurvey {
  code: string;
  name: string;
  countryCode: string;
  visitedAt: number;
}

// Returns the list of recently visited surveys, most recent first
export const getRecentSurveys = (): RecentSurvey[] => {
  const stored = localStorage.getItem(RECENT_SURVEYS_KEY);
  return JSON.parse(stored) ?? [];
};

// Adds a survey to the recent list, capping at MAX_RECENT_SURVEYS
export const addRecentSurvey = (survey: Omit<RecentSurvey, 'visitedAt'>) => {
  const recent = getRecentSurveys();
  const updated = [{ ...survey, visitedAt: Date.now() }, ...recent].slice(0, MAX_RECENT_SURVEYS);
  localStorage.setItem(RECENT_SURVEYS_KEY, JSON.stringify(updated));
};

export const getRecentSurveysForCountry = (countryCode: string): RecentSurvey[] => {
  return getRecentSurveys().filter(s => s.countryCode === countryCode);
};

export const clearRecentSurveys = () => {
  localStorage.removeItem(RECENT_SURVEYS_KEY);
};

export const formatSurveySearchQuery = (surveys: RecentSurvey[], query: string): RecentSurvey[] => {
  return surveys.filter(survey => survey.name.toLowerCase().includes(query.toLowerCase()));
};
