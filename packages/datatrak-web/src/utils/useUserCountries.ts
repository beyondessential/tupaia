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

  const alphabetisedCountries = countries?.sort((a, b) => a.name.localeCompare(b.name)) ?? [];

  const getSelectedCountry = () => {
    if (newSelectedCountry) return newSelectedCountry;

    if (user.countryCode) {
      const country = countries?.find(({ code }) => code === user.countryCode);
      if (country) return country;
    }

    // if the selected project is 'explore', return demo land
    if (user.project?.code === 'explore') {
      return alphabetisedCountries?.find(({ code }) => code === 'DL');
    }

    if (alphabetisedCountries?.length > 0) {
      return alphabetisedCountries[0];
    }

    return null;
  };

  const updateSelectedCountry = (countryCode: Entity['code']) => {
    setSelectedCountry(
      countries?.find(({ code }) => code === countryCode) || countries?.[0] || null,
    );
  };

  const selectedCountry = getSelectedCountry();

  return {
    isLoading: isLoadingUser || isLoadingCountries,
    countries: alphabetisedCountries,
    selectedCountry,
    updateSelectedCountry,
    countryHasUpdated: selectedCountry?.code !== user?.countryCode,
  };
};
