/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { useUrlSearchParams } from '../../utils/useUrlSearchParams';
import { get } from '../api';
import { QUERY_OPTIONS } from './constants';

export const useEmailVerification = () => {
  const [{ verifyEmailToken }] = useUrlSearchParams();

  return useQuery(['user', verifyEmailToken], () => get(`verify/${verifyEmailToken}`), {
    ...QUERY_OPTIONS,
    enabled: !!verifyEmailToken,
  });
};
