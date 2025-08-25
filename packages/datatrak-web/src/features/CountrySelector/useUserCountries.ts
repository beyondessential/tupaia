import { ChangeEvent, ChangeEventHandler, useState } from 'react';

import { camelcaseKeys } from '@tupaia/tsutils';
import { Entity } from '@tupaia/types';
import { EntityRecord } from '@tupaia/tsmodels';

import { UseProjectEntitiesQueryOptions, useCurrentUserContext } from '../../api';
import { ResultObject, useProjectEntities } from '../../hooks/database';
import { EntityResponseObject } from '../../utils/formatEntity';

export type UserCountriesType = Omit<ResultObject<EntityResponseObject[]>, 'data'> & {
  countries: EntityResponseObject[] | null;
  /**
   * @privateRemarks The internal {@link useState} only ever explicitly stores `Country | null`, but
   * `selectedCountry` may be undefined if the {@link useProjectEntities} query is still loading.
   */
  selectedCountry: EntityResponseObject | null | undefined;
  updateSelectedCountry: ChangeEventHandler;
};

export const useUserCountries = (
  useProjectEntitiesQueryOptions?: UseProjectEntitiesQueryOptions,
): UserCountriesType => {
  const user = useCurrentUserContext();
  const [newSelectedCountry, setSelectedCountry] = useState<EntityResponseObject | null>(null);

  const projectCode = user.project?.code;

  const projectEntitiesParams = {
    filter: { type: 'country' },
  };
  const { data: countries = [], ...projectEntitiesQueryResult } = useProjectEntities(
    projectCode,
    projectEntitiesParams,
  );

  const getSelectedCountry = () => {
    // if the country has been changed (but not yet saved), return the new country
    if (newSelectedCountry) return newSelectedCountry;

    // if the user has a country, return that country if it can be found
    if (user.country && countries?.find(country => country.code === user.country?.code)) {
      return camelcaseKeys(user.country) as EntityResponseObject;
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
        (country: EntityResponseObject) => country.code === countryCode,
      );
      setSelectedCountry(newCountry ?? null);
    },
  };
};
