/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { sleep } from '@tupaia/utils';

const response = {
  type: 'Country',
  organisationUnitCode: 'TO',
  countryCode: 'TO',
  name: 'Tonga',
  location: {
    type: 'area',
    point: null,
    bounds: [
      [-24.1625706, 180.604802],
      [-15.3655722, 186.4704542],
    ],
    region: [],
  },
  photoUrl:
    'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1499489588784_647646.png',
  countryHierarchy: [],
};

export const useEntity = (entityCode?: string) => {
  return useQuery(
    ['entity', entityCode],
    async () => {
      await sleep(1000);
      return response;
    },
    { enabled: !!entityCode },
  );
};
