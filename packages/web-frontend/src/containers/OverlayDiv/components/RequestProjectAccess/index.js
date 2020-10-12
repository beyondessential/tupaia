/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Component for Project Access Form
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { Form } from '../../../Form';
import { SubmitButton } from '../../../Form/common';
import { TextField, CheckboxField } from '../../../Form/Fields';
import { aggregateFields } from '../../../Form/utils';
import {
  attemptRequestCountryAccess,
  setOverlayComponent,
  closeUserPage,
} from '../../../../actions';
import { LANDING, OVERLAY_PADDING } from '../../constants';
import { RequestPendingMessage } from './RequestPendingMessage';
import { SuccessMessage } from './SuccessMessage';
import { RequestedProjectCountryAccessList } from './RequestedProjectCountryAccessList';

const Container = styled.div`
  padding: ${OVERLAY_PADDING};
`;

export const RequestProjectAccessComponent = ({
  project,
  countries,
  onBackToProjects,
  onAttemptRequestProjectAccess,
  isFetchingCountryAccessData,
  isRequestingCountryAccess,
  hasRequestCountryAccessCompleted,
  errorMessage,
}) => {
  const { name, code } = project;

  if (hasRequestCountryAccessCompleted)
    return <SuccessMessage handleClose={onBackToProjects} projectName={name} />;

  const requestedCountries = countries.filter(c => c.accessRequests.includes(code));
  const unrequestedCountries = countries.filter(c => !c.accessRequests.includes(code));

  if (unrequestedCountries.length < 1)
    return <RequestPendingMessage handleClose={onBackToProjects} projectName={name} />;

  return (
    <Container>
      <p>
        Requesting access for &nbsp;
        <b>{name}</b>
      </p>
      <RequestedProjectCountryAccessList
        countries={requestedCountries}
        handleClose={onBackToProjects}
      />
      <Form
        isLoading={isFetchingCountryAccessData || isRequestingCountryAccess}
        formError={errorMessage}
        onSubmit={fieldValues =>
          onAttemptRequestProjectAccess(aggregateFields({ ...fieldValues, projectCode: code }))
        }
        render={submitForm => (
          <>
            {unrequestedCountries.map(country => (
              <CheckboxField
                fullWidth
                label={country.name}
                key={country.id}
                name={`entityIds.${country.id}`}
              />
            ))}
            <TextField
              label="Why would you like access to this project?"
              name="message"
              multiline
              rows="4"
              fullWidth
            />
            <SubmitButton handleClick={submitForm} gutterTop>
              Request access
            </SubmitButton>
          </>
        )}
      />
    </Container>
  );
};

RequestProjectAccessComponent.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
  }).isRequired,
  countries: PropTypes.arrayOf(PropTypes.object).isRequired,
  errorMessage: PropTypes.string.isRequired,
  onBackToProjects: PropTypes.func.isRequired,
  onAttemptRequestProjectAccess: PropTypes.func.isRequired,
  isFetchingCountryAccessData: PropTypes.bool.isRequired,
  isRequestingCountryAccess: PropTypes.bool.isRequired,
  hasRequestCountryAccessCompleted: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  const { requestingAccess } = state.project;
  const {
    countries,
    isFetchingCountryAccessData,
    isRequestingCountryAccess,
    hasRequestCountryAccessCompleted,
    errorMessage,
  } = state.requestCountryAccess;

  return {
    project: requestingAccess,
    countries: countries.filter(c => requestingAccess.names.includes(c.name)),
    isFetchingCountryAccessData,
    isRequestingCountryAccess,
    hasRequestCountryAccessCompleted,
    errorMessage,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAttemptRequestProjectAccess: ({ entityIds, message, projectCode }) =>
      dispatch(attemptRequestCountryAccess(entityIds, message, projectCode)),
    onBackToProjects: () => {
      dispatch(setOverlayComponent(LANDING));
      dispatch(closeUserPage());
    },
  };
};

export const RequestProjectAccess = connect(
  mapStateToProps,
  mapDispatchToProps,
)(RequestProjectAccessComponent);
