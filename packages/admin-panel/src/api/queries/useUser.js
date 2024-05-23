/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../../VizBuilderApp/api';

export const useUser = () => {
  const query = useQuery(['user'], () => get('user'), {
    retry: false,
    staleTime: 1000 * 60 * 60 * 1,
  });

  const isLoggedIn = !query.isError && !!query.data && !!query.data.id;

  return {
    ...query,
    isLoggedIn,
  };
};
