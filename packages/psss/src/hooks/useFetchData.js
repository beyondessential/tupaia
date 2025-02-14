import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

const STATUSES = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
};

const DEFAULT_FETCH_STATE = { data: [], count: 0, errorMessage: '', status: STATUSES.IDLE };

export const useFetch = fetchData => {
  const [state, setState] = useState(DEFAULT_FETCH_STATE);

  useEffect(() => {
    let updateState = newState => setState(prevState => ({ ...prevState, ...newState }));

    updateState({ status: STATUSES.LOADING });

    (async () => {
      try {
        const { data, count } = await fetchData();
        updateState({
          ...DEFAULT_FETCH_STATE,
          data,
          count,
          status: STATUSES.SUCCESS,
        });
      } catch (error) {
        updateState({ errorMessage: error.message, status: STATUSES.ERROR });
      }
    })();

    return () => {
      updateState = () => {}; // discard the fetch state update if this request is stale
    };
  }, [fetchData]);

  return {
    isLoading: state.status === STATUSES.IDLE || state.status === STATUSES.LOADING,
    isError: state.status === STATUSES.ERROR,
    isSuccess: state.status === STATUSES.SUCCESS,
    ...state,
  };
};

export const fetchStateShape = {
  data: PropTypes.array.isRequired,
  count: PropTypes.number.isRequired,
  errorMessage: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};
