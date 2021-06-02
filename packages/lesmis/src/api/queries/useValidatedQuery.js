/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useHistory } from 'react-router-dom';
import { useUser } from './useUser';

export const useValidatedQuery = query => {
  const history = useHistory();
  const { isLoggedIn } = useUser();

  if (query.isError && query.error.code === 403) {
    if (isLoggedIn) {
      history.push('/page-not-found');
    } else {
      history.push('/login', { referer: history.location });
    }
  }
  return query;
};
