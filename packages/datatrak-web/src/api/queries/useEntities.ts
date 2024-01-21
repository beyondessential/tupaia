/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { get } from '../api';

export const useEntities = params => {
  return useQuery(
    ['entityDescendants', params],
    (): Promise<DatatrakWebEntitiesRequest.ResBody> => get(`entityDescendants`, { params }),
  );
};
