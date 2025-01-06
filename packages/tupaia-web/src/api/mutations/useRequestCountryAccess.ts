/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { post } from '../api';
import { URL_SEARCH_PARAMS } from '../../constants';
import { CountryAccessListItem } from '../../types';
import { useLandingPage } from '../queries';

type RequestCountryAccessParams = {
  entityIds: CountryAccessListItem['id'][];
  message?: string;
};
export const useRequestCountryAccess = () => {
  const { isLandingPage, landingPageUrlSegment } = useLandingPage();
  const queryClient = useQueryClient();
  const [urlSearchParams] = useSearchParams();
  const params = useParams();
  const projectCode = urlSearchParams.get(URL_SEARCH_PARAMS.PROJECT) || params?.projectCode;
  return useMutation<any, Error, RequestCountryAccessParams, unknown>(
    ({ entityIds, message }: RequestCountryAccessParams) => {
      return post('requestCountryAccess', {
        data: {
          entityIds: Array.isArray(entityIds) ? entityIds : [entityIds], // Ensure entityIds is an array, as when there is only one option in a checkbox list, react-hook-form formats this as a single value string
          message,
          projectCode,
        },
      });
    },
    {
      onSuccess: () => {
        if (isLandingPage) {
          queryClient.invalidateQueries({
            queryKey: ['landingPage', landingPageUrlSegment],
          });
        }

        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    },
  );
};
