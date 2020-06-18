/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Container for Request Country Access Form
 */
import { connect } from 'react-redux';

import { RequestCountryAccessFormComponent } from './RequestCountryAccessFormComponent';
import { attemptRequestCountryAccess, closeUserPage } from '../../actions';

const mapStateToProps = state => {
  const {
    countries,
    isFetchingCountryAccessData,
    isRequestingCountryAccess,
    errorMessage,
    hasRequestCountryAccessCompleted,
  } = state.requestCountryAccess;

  return {
    countries: countries.filter(country => !country.hasAccess),
    isFetchingCountryAccessData,
    isRequestingCountryAccess,
    errorMessage,
    hasRequestCountryAccessCompleted,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAttemptRequestCountryAccess: ({ entityIds, message }) =>
      dispatch(attemptRequestCountryAccess(entityIds, message)),
    onClose: () => dispatch(closeUserPage()),
  };
};

export const RequestCountryAccessForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RequestCountryAccessFormComponent);
