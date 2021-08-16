/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useReducer, createContext, useContext, useCallback } from 'react';

/**
 * This store is designed to hold the state for the vizBuilderConfig
 * All other app state should be managed elsewhere. Try to keep the app state as low as
 * possible in the component tree.
 */
const initialConfigState = {
  project: null,
  location: null,
  testData: null,
  visualisation: {
    id: null,
    name: null,
    code: null,
    permissionGroup: null,
    data: {
      dataElements: [],
      dataGroups: [],
      aggregations: [],
      transform: [],
    },
    presentation: {},
  },
};

const SET_PROJECT = 'SET_PROJECT';
const SET_LOCATION = 'SET_LOCATION';
const SET_VISUALISATION = 'SET_VISUALISATION';
const SET_VISUALISATION_VALUE = 'SET_VISUALISATION_VALUE';
const SET_DATA_CONFIG = 'SET_DATA_CONFIG';
const SET_FETCH_CONFIG = 'SET_FETCH_CONFIG';
const SET_PRESENTATION_CONFIG = 'SET_PRESENTATION_CONFIG';

function configReducer(state, action) {
  const { type } = action;

  switch (type) {
    case SET_LOCATION: {
      const { value } = action;

      if (value === state.location) {
        return state;
      }

      return {
        ...state,
        location: value,
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
      };
    }
    case SET_VISUALISATION: {
      const { value } = action;

      return {
        ...state,
        visualisation: value,
      };
    }
    case SET_VISUALISATION_VALUE: {
      const { key, value } = action;
      return {
        ...state,
        visualisation: {
          ...state.visualisation,
          [key]: value,
        },
      };
    }
    case SET_DATA_CONFIG: {
      const { key, value } = action;
      return {
        ...state,
        visualisation: {
          ...state.visualisation,
          data: { ...state.visualisation.data, [key]: value },
        },
      };
    }
    case SET_FETCH_CONFIG: {
      const { value } = action;
      return {
        ...state,
        visualisation: {
          ...state.visualisation,
          data: {
            aggregations: state.visualisation.data.aggregations,
            transform: state.visualisation.data.transform,
            ...value,
          },
        },
      };
    }
    case SET_PRESENTATION_CONFIG: {
      const { value } = action;
      return {
        ...state,
        visualisation: {
          ...state.visualisation,
          presentation: value,
        },
      };
    }
    default:
      throw new Error('Type not found');
  }
}

const useConfigStore = () => {
  const [state, dispatch] = useReducer(configReducer, initialConfigState);

  const setLocation = useCallback(value => dispatch({ type: SET_LOCATION, value }), []);
  const setProject = useCallback(value => dispatch({ type: SET_PROJECT, value }), []);
  const setVisualisation = useCallback(value => dispatch({ type: SET_VISUALISATION, value }), []);
  const setVisualisationValue = useCallback(
    (key, value) => dispatch({ type: SET_VISUALISATION_VALUE, key, value }),
    [],
  );
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
      setLocation,
      setProject,
      setVisualisation,
      setVisualisationValue,
      setDataConfig,
      setFetchConfig,
      setPresentation,
    },
  ];
};

const vizBuilderConfigStore = createContext(initialConfigState);
const { Provider } = vizBuilderConfigStore;

// eslint-disable-next-line react/prop-types
const VizBuilderConfigProvider = ({ children }) => {
  const store = useConfigStore();

  return (
    <Provider value={store} displayName="VizBuilder">
      {children}
    </Provider>
  );
};

const useVizBuilderConfig = () => {
  return useContext(vizBuilderConfigStore);
};

// Note: the store can be debugged in dev tools using a chrome plugin.
// https://chrome.google.com/webstore/detail/react-context-devtool/oddhnidmicpefilikhgeagedibnefkcf?hl=en
export { useVizBuilderConfig, VizBuilderConfigProvider };
