/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useReducer, createContext, useContext } from 'react';

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
const SET_TEST_DATA = 'SET_TEST_DATA';
const SET_VISUALISATION = 'SET_VISUALISATION';
const SET_VISUALISATION_VALUE = 'SET_VISUALISATION_VALUE';
const SET_DATA_CONFIG = 'SET_DATA_CONFIG';
const SET_FETCH_CONFIG = 'SET_FETCH_CONFIG';
const SET_PRESENTATION_CONFIG = 'SET_PRESENTATION_CONFIG';

const set = (object, key, value) => (object[key] === value ? object : { ...object, [key]: value });

function configReducer(state, action) {
  const { type } = action;

  switch (type) {
    case SET_LOCATION:
      return set(state, 'location', action.value);
    case SET_PROJECT: {
      return set(state, 'project', action.value);
    }
    case SET_TEST_DATA: {
      return set(state, 'testData', action.value);
    }
    case SET_VISUALISATION: {
      return set(state, 'visualisation', action.value);
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

  const setLocation = value => dispatch({ type: SET_LOCATION, value });
  const setProject = value => dispatch({ type: SET_PROJECT, value });
  const setTestData = value => dispatch({ type: SET_TEST_DATA, value });
  const setVisualisation = value => dispatch({ type: SET_VISUALISATION, value });
  const setVisualisationValue = (key, value) =>
    dispatch({ type: SET_VISUALISATION_VALUE, key, value });
  const setPresentation = value => dispatch({ type: SET_PRESENTATION_CONFIG, value });
  const setDataConfig = (key, value) => dispatch({ type: SET_DATA_CONFIG, key, value });
  const setFetchConfig = value => dispatch({ type: SET_FETCH_CONFIG, value });

  return [
    state,
    {
      setLocation,
      setProject,
      setTestData,
      setVisualisation,
      setVisualisationValue,
      setDataConfig,
      setFetchConfig,
      setPresentation,
    },
  ];
};

const VizBuilderConfigContext = createContext(initialConfigState);
const { Provider } = VizBuilderConfigContext;

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
  return useContext(VizBuilderConfigContext);
};

// Note: the store can be debugged in dev tools using a chrome plugin.
// https://chrome.google.com/webstore/detail/react-context-devtool/oddhnidmicpefilikhgeagedibnefkcf?hl=en
export { useVizBuilderConfig, VizBuilderConfigProvider };
