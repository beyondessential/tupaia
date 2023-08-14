/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { useSearchParams } from 'react-router-dom';

export const useEmailVerification = () => {
  const [urlSearchParams] = useSearchParams();
  const verifyEmailToken = urlSearchParams.get('verifyEmailToken');

  return useQuery(
    ['user', verifyEmailToken],
    () => get(`verifyEmail?emailToken=${verifyEmailToken}`),
    { 
      enabled: !!verifyEmailToken,
    },
  );
};
