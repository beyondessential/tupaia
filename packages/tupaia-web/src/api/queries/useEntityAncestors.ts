/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { sleep } from '@tupaia/utils';

const response = [
  {
    code: 'explore',
    name: 'Explore',
    parentEntityCode: null,
  },
  {
    code: 'TO',
    name: 'Tonga',
    parentEntityCode: 'explore',
  },
  {
    code: 'TO_Tongatapu',
    name: 'Tongatapu',
    parentEntityCode: 'TO',
  },
];
export const useEntityAncestors = (rootEntityCode?: string, hierarchyName?: string) => {
  return useQuery(
    ['entityAncestors', hierarchyName, rootEntityCode],
    async () => {
      await sleep(1000);
      return response;
    },
    {
      enabled: !!hierarchyName && !!rootEntityCode,
    },
  );
};
