/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { post } from '../api';
import { Country } from '@tupaia/types';

type RequestCountryAccessParams = {
  entityIds: Country['id'][];
  message?: string;
  projectCode?: string;
};
export const useRequestCountryAccess = () => {
  return useMutation<any, Error, RequestCountryAccessParams, unknown>(
    ({ entityIds, message, projectCode }: RequestCountryAccessParams) => {
      return post('requestCountryAccess', {
        data: {
          entityIds,
          message,
          projectCode,
        },
      });
    },
  );
};
