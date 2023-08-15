/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import camelcaseKeys from 'camelcase-keys';
import { REACT_QUERY_DEFAULTS } from '../constants';

export const useUser = () => {
  const query = useQuery(['user'], () => get(`user`), { ...REACT_QUERY_DEFAULTS, retry: 0 });

  const data = camelcaseKeys(query.data);

  return { ...query, data };
};
