import { ChangeEvent, ChangeEventHandler, useState } from 'react';

import { camelcaseKeys } from '@tupaia/tsutils';
import { Entity, EntityRecord } from '@tupaia/types';

import { UseProjectEntitiesQueryOptions, useCurrentUserContext } from '../../api';
import { ResultObject, useProjectEntities } from '../../hooks/database';

export type UserCountriesType = Omit<ResultObject<EntityRecord[]>, 'data'> & {
  countries: EntityRecord[] | null;
  /**
   * @privateRemarks The internal {@link useState} only ever explicitly stores `Country | null`, but
   * `selectedCountry` may be undefined if the {@link useProjectEntities} query is still loading.
   */
  selectedCountry: Entity | null | undefined;
  updateSelectedCountry: ChangeEventHandler;
};

export const useUserCountries = (
  useProjectEntitiesQueryOptions?: UseProjectEntitiesQueryOptions,
): UserCountriesType => {
  const user = useCurrentUserContext();
  const [newSelectedCountry, setSelectedCountry] = useState<Entity | null>(null);

  const projectCode = user.project?.code;

  const { data: countries = [], ...projectEntitiesQuery } = useProjectEntities(projectCode, {
    type: 'country',
  });

  const getSelectedCountry = () => {
    // if the country has been changed (but not yet saved), return the new country
    if (newSelectedCountry) return newSelectedCountry;

    // if the user has a country, return that country if it can be found
    if (user.country && countries?.find(country => country.code === user.country?.code)) {
      return camelcaseKeys(user.country) as EntityRecord;
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
    ...projectEntitiesQuery,
    selectedCountry,
    updateSelectedCountry: (e: ChangeEvent<HTMLSelectElement>) => {
      const countryCode = e.target.value;
      const newCountry = countries?.find((country: EntityRecord) => country.code === countryCode);
      setSelectedCountry(newCountry ?? null);
    },
  };
};
