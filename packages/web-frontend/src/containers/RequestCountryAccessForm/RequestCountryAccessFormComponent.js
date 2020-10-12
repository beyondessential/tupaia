/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Component for Country Access Form
 */
import React from 'react';
import PropTypes from 'prop-types';
import { PrimaryButton } from '../../components/Buttons';

import { Form } from '../Form';
import { TextField, CheckboxField } from '../Form/Fields';
import { aggregateFields } from '../Form/utils';
import { HasTotalAccessMessage } from './HasTotalAccessMessage';
import { RequestSuccessfulMessage } from './RequestSuccessfulMessage';
import { RequestedCountryAccessList } from './RequestedCountryAccessList';

export const RequestCountryAccessFormComponent = ({
  countries,
  isFetchingCountryAccessData,
  isRequestingCountryAccess,
  errorMessage,
  hasRequestCountryAccessCompleted,
  onAttemptRequestCountryAccess,
  onClose,
}) => {
  if (!countries.length && !isFetchingCountryAccessData)
    return <HasTotalAccessMessage onClose={onClose} />;

  if (hasRequestCountryAccessCompleted) return <RequestSuccessfulMessage onClose={onClose} />;

  const requestedCountries = countries.filter(c => c.accessRequests.includes('none'));
  const unrequestedCountries = countries.filter(
    c => !c.accessRequests.includes('none') && !c.hasAccess,
  );

  return (
    <Form
      isLoading={isFetchingCountryAccessData || isRequestingCountryAccess}
      formError={errorMessage}
      onSubmit={fieldValues => onAttemptRequestCountryAccess(aggregateFields(fieldValues))}
      render={submitForm => (
        <>
          <RequestedCountryAccessList countries={requestedCountries} />
          {unrequestedCountries.map(country => (
            <CheckboxField
              fullWidth
              label={country.name}
              key={country.id}
              name={`entityIds.${country.id}`}
            />
          ))}
          <TextField
            label="Why would you like access?"
            name="message"
            multiline
            rows="4"
            fullWidth
          />
          <PrimaryButton onClick={submitForm}>Request access</PrimaryButton>
        </>
      )}
    />
  );
};

RequestCountryAccessFormComponent.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetchingCountryAccessData: PropTypes.bool.isRequired,
  isRequestingCountryAccess: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  hasRequestCountryAccessCompleted: PropTypes.bool.isRequired,
  onAttemptRequestCountryAccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
