import { ChangeEvent, ChangeEventHandler, useState } from 'react';

import { Country } from '@tupaia/types';
import {
  UseProjectEntitiesQueryOptions,
  useCurrentUserContext,
  useProjectEntities,
} from '../../api';
import { UseProjectEntitiesQueryResult } from '../../api/queries/useProjectEntities';

export type UserCountriesType = Omit<UseProjectEntitiesQueryResult, 'data'> & {
  countries: Country[];
  /**
   * @privateRemarks The internal {@link useState} only ever explicitly stores `Country | null`, but
   * `selectedCountry` may be undefined if the {@link useProjectEntities} query is still loading.
   */
  selectedCountry: Country | null | undefined;
  updateSelectedCountry: ChangeEventHandler;
};

export const useUserCountries = (
  useProjectEntitiesQueryOptions?: UseProjectEntitiesQueryOptions,
): UserCountriesType => {
  const user = useCurrentUserContext();
  const [newSelectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const projectCode = user.project?.code;
  const entityRequestParams = {
    filter: { type: 'country' },
  };
  const { data: countries = [] as Country[], ...projectEntitiesQuery } = useProjectEntities(
    projectCode,
    entityRequestParams,
    useProjectEntitiesQueryOptions,
  );

  const getSelectedCountry = () => {
    // if the country has been changed (but not yet saved), return the new country
    if (newSelectedCountry) return newSelectedCountry;

    // if the user has a country, return that country if it can be found
    if (user.country && countries?.find(({ code }) => code === user.country?.code)) {
      return user.country;
    }

    // if the selected project is 'explore', return demo land
    if (projectCode === 'explore') {
      return countries.find(({ code }) => code === 'DL');
    }

    // otherwise return the first country in the list
    return countries[0];
  };

  const selectedCountry = getSelectedCountry();

  return {
    countries: countries as Country[],
    ...projectEntitiesQuery,

    selectedCountry: selectedCountry as Country,
    updateSelectedCountry: (e: ChangeEvent<HTMLSelectElement>) => {
      const countryCode = e.target.value;
      const newCountry = countries?.find((country) => country.code === countryCode) as Country;
      setSelectedCountry(newCountry ?? null);
    },
  };
};
