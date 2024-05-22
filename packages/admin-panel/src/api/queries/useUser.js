/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../../VizBuilderApp/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

export const useUser = () => {
  const query = useQuery(['user'], () => get('me'), {
    ...DEFAULT_REACT_QUERY_OPTIONS,
  });
  const user = query.data;
  const isLoggedIn = user && Object.keys(user).length > 0;

  return { ...query, isLoggedIn };
};
