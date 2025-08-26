import { ChangeEvent, ChangeEventHandler, useState } from 'react';

import { camelcaseKeys } from '@tupaia/tsutils';

import { useCurrentUserContext } from '../../api';
import { DatabaseEffectOptions, EntityResponse, ResultObject, useProjectEntities } from '../../hooks/database';

export type UserCountriesType = Omit<ResultObject<EntityResponse[]>, 'data'> & {
  countries: EntityResponse[];
  /**
   * @privateRemarks The internal {@link useState} only ever explicitly stores `Country | null`, but
   * `selectedCountry` may be undefined if the {@link useProjectEntities} query is still loading.
   */
  selectedCountry: EntityResponse | null | undefined;
  updateSelectedCountry: ChangeEventHandler;
};

export const useUserCountries = (
  useProjectEntitiesDatabaseEffectOptions?: DatabaseEffectOptions,
): UserCountriesType => {
  const user = useCurrentUserContext();
  const [newSelectedCountry, setSelectedCountry] = useState<EntityResponse | null>(null);

  const projectCode = user.project?.code;

  const projectEntitiesParams = {
    filter: { type: 'country' },
  };
  const { data: countries = [], ...projectEntitiesQueryResult } = useProjectEntities(
    projectCode,
    projectEntitiesParams,
    useProjectEntitiesDatabaseEffectOptions
  );

  const getSelectedCountry = () => {
    // if the country has been changed (but not yet saved), return the new country
    if (newSelectedCountry) return newSelectedCountry;

    // if the user has a country, return that country if it can be found
    if (user.country && countries?.find(country => country.code === user.country?.code)) {
      return camelcaseKeys(user.country) as EntityResponse;
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
    countries,
    ...projectEntitiesQueryResult,
    selectedCountry,
    updateSelectedCountry: (e: ChangeEvent<HTMLSelectElement>) => {
      const countryCode = e.target.value;
      const newCountry = countries?.find(
        (country: EntityResponse) => country.code === countryCode,
      );
      setSelectedCountry(newCountry ?? null);
    },
  };
};
