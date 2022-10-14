/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useUser = () => {
  const query = useQuery('user', () => get('user'), {
    ...DEFAULT_REACT_QUERY_OPTIONS,
  });

  const user = query.data;
  const isLoggedIn = user && Object.keys(user).length > 0;
  const isBESAdmin = user && user.isBESAdmin;
  const isVizBuilderUser = user && user.isVizBuilderUser;

  return { ...query, isLoggedIn, isBESAdmin, isVizBuilderUser };
};
