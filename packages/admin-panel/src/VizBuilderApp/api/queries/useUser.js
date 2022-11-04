/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';
import { reduceIsVizBuilderUser } from '../../../authentication';

export const useUser = () => {
  const query = useQuery('user', () => get('user'), {
    ...DEFAULT_REACT_QUERY_OPTIONS,
  });
  const user = query.data;
  const isLoggedIn = user && Object.keys(user).length > 0;
  const isVizBuilderUser = user && reduceIsVizBuilderUser(user.accessPolicy);

  return { ...query, isLoggedIn, isVizBuilderUser };
};
