/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useHistory } from 'react-router-dom';
import { useHomeUrl } from '../../utils/useHomeUrl';

export const useValidatedQuery = query => {
  const history = useHistory();
  const { homeUrl } = useHomeUrl();

  if (query.isError && query.error.code === 403) {
    history.push(`${homeUrl}/page-not-found`);
  }
  return query;
};
