import { useCallback, useMemo, useState } from 'react';

import { Country, DatatrakWebEntityDescendantsRequest } from '@tupaia/types';
import { useCurrentUserContext, UseProjectEntitiesQueryOptions } from '../../api';
import {
  useProjectCountryEntities,
  UseProjectEntitiesQueryResult,
} from '../../api/queries/useProjectEntities';

export interface UserCountriesType {
  queryResult: UseProjectEntitiesQueryResult;
  state: [
    DatatrakWebEntityDescendantsRequest.EntityResponse | null,
    (countryCode: Country['code']) => DatatrakWebEntityDescendantsRequest.EntityResponse | null,
  ];
}

export const useUserCountries = (
  useProjectEntitiesQueryOptions?: UseProjectEntitiesQueryOptions,
): UserCountriesType => {
  const user = useCurrentUserContext();

  const queryResult = useProjectCountryEntities(
    user.project?.code,
    undefined,
    useProjectEntitiesQueryOptions,
  );
  const { data: countries } = queryResult;

  const countriesByCode = useMemo(
    () =>
      countries?.reduce<
        Record<Country['code'], DatatrakWebEntityDescendantsRequest.EntityResponse>
      >((acc, country) => {
        acc[country.code] = country;
        return acc;
      }, {}),
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

  const state = useState<DatatrakWebEntityDescendantsRequest.EntityResponse | null>(
    getInitialCountrySelection,
  );
  const [selectedCountry, setSelectedCountry] = state;

  if (
    countries && // Once country list is loaded...
    countries.length > 0 && // ...it’s nonempty...
    // ...and user has no selection OR has stale selection (e.g. after project change)...
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

  return {
    queryResult,
    state: [selectedCountry, updateSelectedCountry],
  };
};
