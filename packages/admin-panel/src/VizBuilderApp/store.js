/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useReducer, createContext, useContext, useCallback } from 'react';

const initialState = {
  name: null,
  summary: null,
  project: null,
  location: null,
  permissionGroup: null,
  data: {
    dataElements: [],
    dataGroups: [],
    aggregations: [],
    transform: [],
  },
  presentation: {},
};

const SET_VALUE = 'SET_VALUE';
const SET_PROJECT = 'SET_PROJECT';
const SET_DATA_CONFIG = 'SET_DATA_CONFIG';
const SET_FETCH_CONFIG = 'SET_FETCH_CONFIG';
const SET_PRESENTATION_CONFIG = 'SET_PRESENTATION_CONFIG';

function appReducer(state, action) {
  const { type } = action;

  switch (type) {
    case SET_VALUE: {
      const { key, value } = action;
      return {
        ...state,
        [key]: value,
      };
    }
    case SET_PROJECT: {
      const { value } = action;

      if (value === state.project) {
        return state;
      }

      return {
        ...state,
        project: value,
        location: null,
      };
    }
    case SET_DATA_CONFIG: {
      const { key, value } = action;
      return {
        ...state,
        data: { ...state.data, [key]: value },
      };
    }
    case SET_FETCH_CONFIG: {
      const { value } = action;
      return {
        ...state,
        data: { ...state.data, ...value },
      };
    }
    case SET_PRESENTATION_CONFIG: {
      const { value } = action;
      return {
        ...state,
        presentation: value,
      };
    }
    default:
      throw new Error('Type not found');
  }
}

const useAppState = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setValue = useCallback((key, value) => dispatch({ type: SET_VALUE, key, value }), []);
  const setProject = useCallback(value => dispatch({ type: SET_PROJECT, value }), []);
  const setPresentation = useCallback(
    value => dispatch({ type: SET_PRESENTATION_CONFIG, value }),
    [],
  );
  const setDataConfig = useCallback(
    (key, value) => dispatch({ type: SET_DATA_CONFIG, key, value }),
    [],
  );
  const setFetchConfig = useCallback(value => dispatch({ type: SET_FETCH_CONFIG, value }), []);

  return [
    state,
    {
      setDataConfig,
      setFetchConfig,
      setProject,
      setPresentation,
      setValue,
    },
  ];
};

const store = createContext(initialState);
const { Provider } = store;

// eslint-disable-next-line react/prop-types
const StoreProvider = ({ children }) => {
  const obj = useAppState();

  return (
    <Provider value={obj} displayName="VizBuilder">
      {children}
    </Provider>
  );
};

const useStore = () => {
  return useContext(store);
};

// Note: the store can be degged in dev tools using a chrome plugin.
// https://chrome.google.com/webstore/detail/react-context-devtool/oddhnidmicpefilikhgeagedibnefkcf?hl=en
export { useStore, StoreProvider };
