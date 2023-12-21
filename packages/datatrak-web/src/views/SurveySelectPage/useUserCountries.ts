/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useState } from 'react';
import { useEntities, useCurrentUser } from '../../api';
import { Entity } from '../../types';

export const useUserCountries = () => {
  const user = useCurrentUser();
  const [newSelectedCountry, setSelectedCountry] = useState<Entity | null>(null);
  const { data: countries, isLoading: isLoadingCountries } = useEntities(user.project?.code, {
    type: 'country',
  });

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
    if (user.project?.code === 'explore') {
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
    isLoading: isLoadingCountries || !countries,
    countries: alphabetisedCountries,
    selectedCountry,
    updateSelectedCountry: setSelectedCountry,
    // if the user has a country code, and it doesn't match the selected country, then the country has been updated, which means we need to update the user
    countryHasUpdated: selectedCountry?.code !== user.country?.code,
  };
};
