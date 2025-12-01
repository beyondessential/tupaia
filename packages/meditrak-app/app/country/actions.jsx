import {
  COUNTRY_SELECT,
  COUNTRY_MENU_SHOW,
  COUNTRY_MENU_HIDE,
  COUNTRY_ACCESS_REQUEST_START,
  COUNTRY_ACCESS_REQUEST_SUCCESS,
  COUNTRY_ACCESS_REQUEST_FAIL,
  FORM_RESET,
  COUNTRY_ACCESS_FORM_FIELD_VALUES_SET,
  RECEIVE_COUNTRIES,
} from './constants';

export const selectCountry = (id, name) => ({
  type: COUNTRY_SELECT,
  id,
  name,
});

export const showCountryMenu = () => ({
  type: COUNTRY_MENU_SHOW,
});

export const hideCountryMenu = () => ({
  type: COUNTRY_MENU_HIDE,
});

export const beginCountryAccessRequest = () => ({
  type: COUNTRY_ACCESS_REQUEST_START,
});

export const completeCountryAccessRequest = () => ({
  type: COUNTRY_ACCESS_REQUEST_SUCCESS,
});

export const receiveCountryAccessRequestError = errorMessage => ({
  type: COUNTRY_ACCESS_REQUEST_FAIL,
  errorMessage,
});

export const resetForm = () => ({
  type: FORM_RESET,
});

export const setCountryAccessFormFieldValues = fieldValues => ({
  type: COUNTRY_ACCESS_FORM_FIELD_VALUES_SET,
  fieldValues,
});

export const sendCountryAccessRequest =
  (entityIds, message) =>
  async (dispatch, getState, { api }) => {
    dispatch(beginCountryAccessRequest());

    const payload = {
      entityIds,
      message,
    };

    let response;

    try {
      response = await api.post(`me/requestCountryAccess`, {}, JSON.stringify(payload));
      if (response.error) throw new Error(response.error);
    } catch (error) {
      dispatch(receiveCountryAccessRequestError(error.message));
      return;
    }

    dispatch(completeCountryAccessRequest());
  };

export const loadCountriesFromDatabase =
  () =>
  (dispatch, getState, { database }) => {
    const countries = database.getCountries();
    const currentUser = database.getCurrentUser();

    const availableCountries = [];
    const unavailableCountries = [];

    countries.forEach(country => {
      if (
        currentUser.hasAccessToSomeEntity([country]) ||
        currentUser.hasAccessToSomeEntity(database.getDescendantsOfCountry(country))
      ) {
        availableCountries.push(country);
      } else {
        unavailableCountries.push(country);
      }
    });

    dispatch({
      type: RECEIVE_COUNTRIES,
      availableCountries,
      unavailableCountries,
    });
  };
