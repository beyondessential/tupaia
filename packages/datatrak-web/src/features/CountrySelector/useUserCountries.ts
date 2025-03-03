import { useState } from 'react';

import {
  UseProjectEntitiesQueryOptions,
  useCurrentUserContext,
  useProjectEntities,
} from '../../api';
import { Entity } from '../../types';

export const useUserCountries = (
  useProjectEntitiesQueryOptions?: UseProjectEntitiesQueryOptions,
) => {
  const user = useCurrentUserContext();
  const [newSelectedCountry, setSelectedCountry] = useState<Entity | null>(null);

  const projectCode = user.project?.code;
  const entityRequestParams = {
    filter: { type: 'country' },
  };
  const {
    data: countries,
    isLoading: isLoadingCountries,
    isError,
  } = useProjectEntities(projectCode, entityRequestParams, useProjectEntitiesQueryOptions);

  // sort the countries alphabetically so they are in a consistent order for the user
  const alphabetisedCountries = countries?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];

  const getSelectedCountry = () => {
    // if the country has been changed (but not yet saved), return the new country
    if (newSelectedCountry) return newSelectedCountry;

    // if the user has a country, return that country if it can be found
    if (user.country && countries?.find(({ code }) => code === user.country?.code)) {
      return user.country;
    }

    // if the selected project is 'explore', return demo land
    if (projectCode === 'explore') {
      return alphabetisedCountries?.find(({ code }) => code === 'DL');
    }

    // otherwise return the first country in the list
    if (alphabetisedCountries?.length > 0) {
      return alphabetisedCountries[0];
    }

    return null;
  };

  const selectedCountry = getSelectedCountry();

  return {
    isLoading: isLoadingCountries || (!countries && !isError),
    countries: alphabetisedCountries,
    selectedCountry,
    updateSelectedCountry: e => {
      const countryCode = e.target.value;
      const newCountry = countries?.find((country: Entity) => country.code === countryCode);
      console.log(`updateSelectedCountry( ${e} )`);
      console.log(countryCode);
      console.log(newCountry);
      setSelectedCountry(newCountry ?? null);
    },
  };
};
