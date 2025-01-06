/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from '@tanstack/react-query';
import { get } from '../api';

export const useEntityByCode = (entityCode, options?) => {
  return useQuery(['entity', entityCode], () => get(`entity/${entityCode}`), options);
};

export const useEntityById = (entityId, options?) => {
  return useQuery(
    ['entities', entityId],
    async () => {
      const response = await get(`entities`, {
        params: { filter: { id: entityId } },
      });
      return response[0];
    },
    options,
  );
};
