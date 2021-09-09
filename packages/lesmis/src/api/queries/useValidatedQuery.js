/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useHistory } from 'react-router-dom';

export const useValidatedQuery = query => {
  const history = useHistory();
  if (query.isError && query.error.code === 403) {
    history.push('/page-not-found');
  }
  return query;
};
