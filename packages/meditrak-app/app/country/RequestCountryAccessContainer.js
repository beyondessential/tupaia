/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { connect } from 'react-redux';

import { RequestCountryAccessPage } from './RequestCountryAccessPage';
import { COUNTRY_REQUEST_STATUSES } from './constants';
import { sendCountryAccessRequest, setCountryAccessFormFieldValues } from './actions';

function mapStateToProps({ country, authentication }) {
  const { requestCountryStatus, requestCountryErrorMessage, requestCountryFieldValues } = country;

  const { accessPolicy } = authentication;

  return {
    isLoading: requestCountryStatus === COUNTRY_REQUEST_STATUSES.COUNTRY_REQUESTING,
    isComplete: requestCountryStatus === COUNTRY_REQUEST_STATUSES.COUNTRY_REQUEST_SUCCESS,
    errorMessage: requestCountryErrorMessage,
    formFieldValues: requestCountryFieldValues,
    accessPolicy,
  };
}

function mapDispatchToProps(dispatch, { screenProps }) {
  const { database } = screenProps;

  return {
    onSubmitFields: ({ countryIds, message }) =>
      dispatch(sendCountryAccessRequest(countryIds, message)),
    onFormFieldChange: fieldValues => dispatch(setCountryAccessFormFieldValues(fieldValues)),
    getCountries: () => database.getCountries(),
  };
}

const RequestCountryAccessContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RequestCountryAccessPage);

export { RequestCountryAccessContainer };
