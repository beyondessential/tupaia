/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useSurveys } from '../api/queries';
import { Entity, Survey } from '../types';

export const useUserSurveys = (selectedCountryName?: Entity['name']) => {
  const { data: surveys, isLoading, isFetched } = useSurveys();
  if (!selectedCountryName) return { isLoading: true, surveys: [] };

  const selectedCountrySurveys = surveys?.filter((survey: Survey) =>
    survey.countryNames?.includes(selectedCountryName),
  );

  return { isLoading: isLoading || !isFetched, surveys: selectedCountrySurveys };
};
