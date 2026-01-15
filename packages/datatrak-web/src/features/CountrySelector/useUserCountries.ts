import { ChangeEvent, ChangeEventHandler, useCallback, useMemo, useState } from 'react';

import { camelcaseKeys } from '@tupaia/tsutils';
import { Country, DatatrakWebEntitiesRequest } from '@tupaia/types';
import {
  useCurrentUserContext,
  useProjectEntities,
  UseProjectEntitiesQueryOptions,
} from '../../api';
import {
  useProjectCountryEntities,
  UseProjectEntitiesQueryResult,
} from '../../api/queries/useProjectEntities';

export type UserCountriesType = UseProjectEntitiesQueryResult & {
  /**
   * @privateRemarks The internal {@link useState} only ever explicitly stores `Country | null`, but
   * `selectedCountry` may be undefined if the {@link useProjectEntities} query is still loading.
   */
  selectedCountry: DatatrakWebEntitiesRequest.EntitiesResponseItem | null | undefined;
  updateSelectedCountry: ChangeEventHandler;
};

export const useUserCountries = (
  useProjectEntitiesQueryOptions?: UseProjectEntitiesQueryOptions,
): UserCountriesType => {
  const user = useCurrentUserContext();

  const [newSelectedCountry, setSelectedCountry] =
    useState<DatatrakWebEntitiesRequest.EntitiesResponseItem | null>(null);

  const projectCode = user.project?.code;
  const projectEntitiesQuery = useProjectCountryEntities(
    projectCode,
    undefined,
    useProjectEntitiesQueryOptions,
  );
  const countries = projectEntitiesQuery.data;

  const selectedCountry = (() => {
    if (!countries) return undefined;

    // if the country has been changed (but not yet saved), return the new country
    if (newSelectedCountry) return newSelectedCountry;

    // if the user has a country, return that country if it can be found
    if (user.country && countries.some(c => c.code === user.country?.code))
      return camelcaseKeys(user.country) as DatatrakWebEntitiesRequest.EntitiesResponseItem;

    // if the selected project is 'explore', return demo land
    if (projectCode === 'explore') return countries.find(c => c.code === 'DL');

    // otherwise return the first country in the list
    return countries[0] ?? null;
  })();

  return {
    ...projectEntitiesQuery,
    selectedCountry,
    updateSelectedCountry: (e: ChangeEvent<HTMLSelectElement>) => {
      const countryCode = e.target.value;
      const newCountry = countries?.find(country => country.code === countryCode);
      setSelectedCountry(newCountry ?? null);
    },
  };
};

export function useSelectedCountryState(): [
  DatatrakWebEntitiesRequest.EntitiesResponseItem | null,
  (countryCode: Country['code']) => DatatrakWebEntitiesRequest.EntitiesResponseItem | null,
] {
  const user = useCurrentUserContext();
  const { data: countries, isLoading: isLoadingCountries } = useProjectCountryEntities(
    user.project?.code,
  );

  const countriesByCode = useMemo(
    () =>
      countries?.reduce<Record<Country['code'], DatatrakWebEntitiesRequest.EntitiesResponseItem>>(
        (acc, country) => {
          acc[country.code] = country;
          return acc;
        },
        {},
      ),
    [countries],
  );

  const getInitialCountrySelection = useCallback(() => {
    if (!countries || !countriesByCode) return null;

    // If user has a country, return that if accessible in current project
    if (user.country && countriesByCode[user.country.code]) {
      return countriesByCode[user.country.code];
    }

    // For Explore project, return Demo Land
    if (user.project?.code === 'explore') return countriesByCode.DL;

    // Else, arbitrarily return first in list
    return countries[0] ?? null;
  }, [countries, countriesByCode, user.country, user.project?.code]);

  const [selectedCountry, setSelectedCountry] =
    useState<DatatrakWebEntitiesRequest.EntitiesResponseItem | null>(getInitialCountrySelection);

  if (
    !isLoadingCountries && // Once country list is loaded, if user has...
    // ...no selection OR stale selection (e.g. after project change)...
    (!selectedCountry || !countriesByCode?.[selectedCountry.code])
  ) {
    // ...reinitialise as if user has no country selected.
    setSelectedCountry(getInitialCountrySelection());
  }

  const updateSelectedCountry = (countryCode: Country['code']) => {
    const newCountry = countriesByCode?.[countryCode] ?? null;
    setSelectedCountry(newCountry);
    return newCountry;
  };

  return [selectedCountry, updateSelectedCountry];
}
