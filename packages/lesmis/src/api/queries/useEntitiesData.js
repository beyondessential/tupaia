/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import keyBy from 'lodash.keyby';
import { get } from '../api';
import { PROJECT_CODE } from '../../constants';

const DEFAULT_PARAMS = { includeRootEntity: true };

export const useEntitiesData = (entityCode, params = DEFAULT_PARAMS) => {
  const query = useQuery(
    ['entities', entityCode],
    () => get(`entities/${entityCode}`, { params }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  const entitiesByCode = keyBy(query.data, 'code');
  return { ...query, entitiesByCode };
};

const DEFAULT_PROJECT_PARAMS = {
  fields: 'id,child_codes,code,country_code,image_url,name,type,parent_code',
};

export const useProjectEntitiesData = (params = DEFAULT_PROJECT_PARAMS) =>
  useEntitiesData(PROJECT_CODE, params);
