/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useModal } from '../../utils';
import { post } from '../api';
import { Country } from '@tupaia/types';

type RequestCountryAccessParams = {
  entityIds: Country['id'][];
  message?: string;
};
export const useRequestCountryAccess = () => {
  return useMutation<any, Error, RequestCountryAccessParams, unknown>(
    ({ entityIds, message }: RequestCountryAccessParams) => {
      return post('requestCountryAccess', {
        data: {
          entityIds,
          message,
        },
      });
    },
  );
};
