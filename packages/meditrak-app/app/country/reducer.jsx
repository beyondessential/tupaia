import { createReducer } from '../utilities';
import {
  COUNTRY_ACCESS_REQUEST_START,
  COUNTRY_ACCESS_REQUEST_SUCCESS,
  COUNTRY_ACCESS_REQUEST_FAIL,
  FORM_RESET,
  COUNTRY_REQUEST_STATUSES,
  COUNTRY_ACCESS_FORM_FIELD_VALUES_SET,
  COUNTRY_SELECT,
  COUNTRY_MENU_HIDE,
  COUNTRY_MENU_SHOW,
  RECEIVE_COUNTRIES,
} from './constants';

import { LOGOUT, LOGIN_REQUEST } from '../authentication';

const { COUNTRY_REQUEST_IDLE, COUNTRY_REQUESTING, COUNTRY_REQUEST_SUCCESS } =
  COUNTRY_REQUEST_STATUSES;

const defaultState = {
  selectedCountryName: null,
  selectedCountryId: null,
  isCountryMenuVisible: false,
  availableCountries: [],
  unavailableCountries: [],
  requestCountryStatus: COUNTRY_REQUEST_IDLE,
  requestCountryErrorMessage: '',
  requestCountryFieldValues: {},
};

const stateChanges = {
  [COUNTRY_SELECT]: ({ id, name }) => ({
    selectedCountryId: id,
    selectedCountryName: name,
    isCountryMenuVisible: false,
  }),
  [COUNTRY_MENU_SHOW]: () => ({
    isCountryMenuVisible: true,
  }),
  [COUNTRY_MENU_HIDE]: () => ({
    isCountryMenuVisible: false,
  }),
  [RECEIVE_COUNTRIES]: ({ availableCountries, unavailableCountries }) => ({
    availableCountries,
    unavailableCountries,
  }),
  [COUNTRY_ACCESS_REQUEST_START]: () => ({
    requestCountryStatus: COUNTRY_REQUESTING,
    requestCountryErrorMessage: '',
  }),
  [COUNTRY_ACCESS_REQUEST_SUCCESS]: () => ({
    requestCountryStatus: COUNTRY_REQUEST_SUCCESS,
    requestCountryErrorMessage: '',
  }),
  [COUNTRY_ACCESS_REQUEST_FAIL]: ({ errorMessage }) => ({
    requestCountryStatus: COUNTRY_REQUEST_IDLE,
    requestCountryErrorMessage: errorMessage,
  }),
  [FORM_RESET]: () => ({
    requestCountryStatus: COUNTRY_REQUEST_IDLE,
    requestCountryErrorMessage: '',
  }),
  [COUNTRY_ACCESS_FORM_FIELD_VALUES_SET]: ({ fieldValues }) => ({
    requestCountryFieldValues: fieldValues,
    requestCountryStatus: COUNTRY_REQUEST_IDLE,
  }),
  [LOGIN_REQUEST]: () => ({
    selectedCountryId: defaultState.selectedCountryId,
    selectedCountryName: defaultState.selectedCountryName,
  }),
  [LOGOUT]: () => defaultState,
};

const onRehydrate = incomingState => {
  if (!incomingState) return undefined;

  const countryState = incomingState.country;
  if (!countryState) return undefined;

  // Ensure state never gets stuck in loading loop.
  countryState.requestCountryStatus = defaultState.requestCountryStatus;

  return countryState;
};

export const reducer = createReducer(defaultState, stateChanges, onRehydrate);
