/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from '@tanstack/react-query';
import { DatatrakWebEntityDescendantsRequest } from '@tupaia/types';
import { get } from '../api';

export const useProjectEntities = (
  projectCode?: string,
  params?: DatatrakWebEntityDescendantsRequest.ReqBody,
  enabled = true,
  options?: { onError?: (error: any) => void },
) => {
  return useQuery(
    ['entityDescendants', projectCode, params],
    (): Promise<DatatrakWebEntityDescendantsRequest.ResBody> => {
      return get('entityDescendants', {
        params: { ...params, filter: { ...params?.filter, projectCode } },
      });
    },
    { enabled: !!projectCode && enabled, onError: options?.onError ?? undefined },
  );
};
