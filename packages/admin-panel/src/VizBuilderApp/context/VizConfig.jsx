import React, { createContext, useContext, useReducer } from 'react';

/**
 * This store is designed to hold the state for the vizBuilderConfig
 * All other app state should be managed elsewhere. Try to keep the app state as low as
 * possible in the component tree.
 */
const initialConfigState = {
  vizType: null,
  project: null,
  location: null,
  startDate: null,
  endDate: null,
  testData: null,
  visualisation: {
    id: null,
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
const SET_START_DATE = 'SET_START_DATE';
const SET_END_DATE = 'SET_END_DATE';
const SET_TEST_DATA = 'SET_TEST_DATA';
const SET_VIZ_TYPE = 'SET_VIZ_TYPE';
const SET_VISUALISATION = 'SET_VISUALISATION';
const SET_VISUALISATION_VALUE = 'SET_VISUALISATION_VALUE';
const SET_DATA_CONFIG = 'SET_DATA_CONFIG';
const SET_PRESENTATION_CONFIG = 'SET_PRESENTATION_CONFIG';
const SET_PRESENTATION_CONFIG_VALUE = 'SET_PRESENTATION_CONFIG_VALUE';

const set = (object, key, value) => (object[key] === value ? object : { ...object, [key]: value });

function configReducer(state, action) {
  const { type } = action;

  switch (type) {
    case SET_LOCATION:
      return set(state, 'location', action.value);
    case SET_PROJECT:
      return set(state, 'project', action.value);
    case SET_START_DATE:
      return set(state, 'startDate', action.value);
    case SET_END_DATE:
      return set(state, 'endDate', action.value);
    case SET_TEST_DATA:
      return set(state, 'testData', action.value);
    case SET_VIZ_TYPE:
      return set(state, 'vizType', action.value);
    case SET_VISUALISATION:
      return set(state, 'visualisation', action.value);
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
    case SET_PRESENTATION_CONFIG_VALUE: {
      const { key, value } = action;
      return {
        ...state,
        visualisation: {
          ...state.visualisation,
          presentation: {
            ...state.visualisation.presentation,
            [key]: value,
          },
        },
      };
    }
    default:
      throw new Error(`Unexpected viz type: ‘${type}’`);
  }
}

const useConfigStore = () => {
  const [state, dispatch] = useReducer(configReducer, initialConfigState);

  const setLocation = value => dispatch({ type: SET_LOCATION, value });
  const setProject = value => dispatch({ type: SET_PROJECT, value });
  const setStartDate = value => dispatch({ type: SET_START_DATE, value });
  const setEndDate = value => dispatch({ type: SET_END_DATE, value });
  const setTestData = value => dispatch({ type: SET_TEST_DATA, value });
  const setVizType = value => dispatch({ type: SET_VIZ_TYPE, value });
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
  const setPresentationValue = (key, value) =>
    dispatch({ type: SET_PRESENTATION_CONFIG_VALUE, key, value });
  const setDataConfig = (key, value) => dispatch({ type: SET_DATA_CONFIG, key, value });

  return [
    state,
    {
      setLocation,
      setProject,
      setStartDate,
      setEndDate,
      setTestData,
      setVizType,
      setVisualisation,
      setVisualisationValue,
      setDataConfig,
      setPresentation,
      setPresentationValue,
    },
  ];
};

const VisualisationContext = createContext(initialConfigState.visualisation);

const amendStepsToBaseConfig = visualisation => {
  const { data } = { ...visualisation };
  const { transform } = data;

  // Remove frontend configs (isDisabled, id, schema) in transform steps. If it is an alias return as a string.
  const filteredTransform = Array.isArray(transform)
    ? transform.map(({ isDisabled, id, schema, ...restOfConfig }) =>
        restOfConfig.alias ? restOfConfig.transform : restOfConfig,
      )
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

const useVisualisationContext = () => useContext(VisualisationContext);

const useVizConfigContext = () => useContext(VizBuilderConfigContext);

// Note: the store can be debugged in dev tools using a chrome plugin.
// https://chrome.google.com/webstore/detail/react-context-devtool/oddhnidmicpefilikhgeagedibnefkcf
export { useVisualisationContext, useVizConfigContext, VizConfigProvider };
