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
  const setVisualisation = value => {
    if (!value.data.transform) {
      return dispatch({ type: SET_VISUALISATION, value });
    }

    const { transform } = value.data;
    const sanitisedTransform = transform.map(conf =>
      typeof conf === 'string' ? { transform: conf, alias: true } : conf,
    );
    const sanitisedData = { ...value.data, transform: sanitisedTransform };
    const sanitisedValue = {
      ...value,
      data: sanitisedData,
    };

    return dispatch({ type: SET_VISUALISATION, value: sanitisedValue });
  };
  const setVisualisationValue = (key, value) =>
    dispatch({ type: SET_VISUALISATION_VALUE, key, value });
  const setPresentation = value => dispatch({ type: SET_PRESENTATION_CONFIG, value });
  const setDataConfig = (key, value) => dispatch({ type: SET_DATA_CONFIG, key, value });

  return [
    state,
    {
      setLocation,
      setProject,
      setTestData,
      setVisualisation,
      setVisualisationValue,
      setDataConfig,
      setPresentation,
    },
  ];
};

const VisualisationContext = createContext(initialConfigState.visualisation);

const amendStepsToBaseConfig = visualisation => {
  const { data } = { ...visualisation };
  const { transform } = data;

  // Remove frontend configs (isDisabled, id, schema) in transform steps. If it is an alias return as a string.
  const filteredTransform = Array.isArray(transform)
    ? transform.map(({ isDisabled, id, schema, ...restOfConfig }) => {
        if (restOfConfig.alias) {
          return restOfConfig.transform;
        }
        return {
          ...restOfConfig,
        };
      })
    : transform;

  const filteredData = { ...data, transform: filteredTransform };
  return { ...visualisation, data: filteredData };
};

// Filter those unchecked aggregation or transform steps
const filterDisabledSteps = visualisation => {
  const { data } = { ...visualisation };
  const { aggregate, transform } = { ...data };
  const filteredAggregate = Array.isArray(aggregate)
    ? aggregate.filter(({ isDisabled }) => !isDisabled)
    : aggregate;
  const filteredTransform = Array.isArray(transform)
    ? transform.filter(({ isDisabled }) => !isDisabled)
    : transform;
  const filteredData = { ...data, aggregate: filteredAggregate, transform: filteredTransform };
  return { ...visualisation, data: filteredData };
};

const VizBuilderConfigContext = createContext(initialConfigState);

// eslint-disable-next-line react/prop-types
const VizConfigProvider = ({ children }) => {
  const store = useConfigStore();
  const [{ visualisation }] = store;

  return (
    <VisualisationContext.Provider
      value={{
        visualisationForFetchingData: amendStepsToBaseConfig(filterDisabledSteps(visualisation)),
        visualisation: amendStepsToBaseConfig(visualisation),
      }}
    >
      <VizBuilderConfigContext.Provider value={store} displayName="VizBuilder">
        {children}
      </VizBuilderConfigContext.Provider>
    </VisualisationContext.Provider>
  );
};

const useVisualisation = () => {
  return useContext(VisualisationContext);
};

const useVizConfig = () => {
  return useContext(VizBuilderConfigContext);
};

// Note: the store can be debugged in dev tools using a chrome plugin.
// https://chrome.google.com/webstore/detail/react-context-devtool/oddhnidmicpefilikhgeagedibnefkcf?hl=en
export { useVisualisation, useVizConfig, VizConfigProvider };
