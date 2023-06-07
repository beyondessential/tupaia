/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useNavigate } from 'react-router';
import { UseQueryResult } from 'react-query';

export const useValidatedQuery = (queryResult: UseQueryResult) => {
  const navigate = useNavigate();
  // @ts-ignore - issue with types for error TODO: override types
  if (queryResult.isError && queryResult.error && queryResult.error.code === 403) {
    navigate('/page-not-found');
  }
  return queryResult;
};
