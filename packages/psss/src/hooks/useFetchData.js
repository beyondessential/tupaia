/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useEffect, useState } from 'react';

const FETCH_STATUSES = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

const DEFAULT_FETCH_STATE = { data: [], count: 0, errorMessage: '', status: FETCH_STATUSES.IDLE };

export const useFetch = fetchData => {
  const [fetchState, setFetchState] = useState(DEFAULT_FETCH_STATE);

  useEffect(() => {
    let updateFetchState = newFetchState =>
      setFetchState(prevFetchState => ({ ...prevFetchState, ...newFetchState }));

    updateFetchState({ status: FETCH_STATUSES.LOADING });

    (async () => {
      try {
        const { data, count } = await fetchData();
        updateFetchState({
          ...DEFAULT_FETCH_STATE,
          data,
          count,
          status: FETCH_STATUSES.SUCCESS,
        });
      } catch (error) {
        updateFetchState({ errorMessage: error.message, status: FETCH_STATUSES.ERROR });
      }
    })();

    return () => {
      updateFetchState = () => {}; // discard the fetch state update if this request is stale
    };
  }, [fetchData]);

  return { ...fetchState };
};
