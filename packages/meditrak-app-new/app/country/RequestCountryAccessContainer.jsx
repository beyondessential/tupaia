/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';

import { database } from '../database';
import { RequestCountryAccessPage } from './RequestCountryAccessPage';
import { COUNTRY_REQUEST_STATUSES } from './constants';
import { sendCountryAccessRequest, setCountryAccessFormFieldValues } from './actions';

function mapStateToProps({ country, authentication }) {
  const { requestCountryStatus, requestCountryErrorMessage, requestCountryFieldValues } = country;

  const { currentUserId } = authentication;
  const user = database.findOne('User', currentUserId, 'id');
  return {
    isLoading: requestCountryStatus === COUNTRY_REQUEST_STATUSES.COUNTRY_REQUESTING,
    isComplete: requestCountryStatus === COUNTRY_REQUEST_STATUSES.COUNTRY_REQUEST_SUCCESS,
    errorMessage: requestCountryErrorMessage,
    formFieldValues: requestCountryFieldValues,
    accessPolicy: user.accessPolicy,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSubmitFields: ({ entityIds, message }) =>
      dispatch(sendCountryAccessRequest(entityIds, message)),
    onFormFieldChange: fieldValues => dispatch(setCountryAccessFormFieldValues(fieldValues)),
    getCountries: () => database.getCountryEntities(),
  };
}

const RequestCountryAccessContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RequestCountryAccessPage);

export { RequestCountryAccessContainer };
