/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useState } from 'react';
import { useEntities, useUser } from '../api/queries';
import { Entity } from '../types';

export const useUserCountries = () => {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const [newSelectedCountry, setSelectedCountry] = useState<Entity | null>(null);
  const { data: countries, isLoading: isLoadingCountries } = useEntities(user?.project?.code, {
    type: 'country',
  });

  // sort the countries alphabetically so they are in a consistent order for the user
  const alphabetisedCountries = countries?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];

  const getSelectedCountry = () => {
    // if the country has been changed (but not yet saved), return the new country
    if (newSelectedCountry) return newSelectedCountry;

    // if the user has a country code, return that country if it can be found
    if (user.countryCode) {
      const country = countries?.find(({ code }) => code === user.countryCode);
      if (country) return country;
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

  // Update the selected country to the country that matches the new country code
  const updateSelectedCountry = (countryCode: Entity['code']) => {
    setSelectedCountry(
      countries?.find(({ code }) => code === countryCode) || countries?.[0] || null,
    );
  };

  const selectedCountry = getSelectedCountry();

  return {
    isLoading: isLoadingUser || isLoadingCountries || !countries,
    countries: alphabetisedCountries,
    selectedCountry,
    updateSelectedCountry,
    // if the user has a country code, and it doesn't match the selected country, then the country has been updated, which means we need to update the user
    countryHasUpdated: selectedCountry?.code !== user?.countryCode,
  };
};
