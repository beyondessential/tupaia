/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SmallAlert, TooltipIconButton } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { DialogContent } from '@material-ui/core';

const Content = styled(DialogContent)`
  text-align: left;
  min-height: 220px;
  border-color: ${props => props.theme.palette.grey['400']};
  border-style: solid;
  border-width: 1px 0;
  padding-block: 1.25rem;
  padding-inline: 1.9rem;
  display: flex;
  flex-direction: column;
`;

const Heading = styled(Typography)`
  margin-bottom: 1.1rem;
  font-size: ${props => props.theme.typography.body1.fontSize};
`;

const Alert = styled(SmallAlert).attrs({
  severity: 'error',
  variant: 'standard',
})`
  &:not(:last-child) {
    margin-block-end: 1.5årem;
  }
`;

const Error = ({ message, details }) => {
  return (
    <div>
      <Alert>{message}</Alert>
      {details && <TooltipIconButton tooltip={details} />}
    </div>
  );
};

Error.propTypes = {
  message: PropTypes.string.isRequired,
  details: PropTypes.string,
};

Error.defaultProps = {
  details: null,
};

export const ModalContentProvider = ({ isLoading, error, children }) => {
  const getHeading = () => {
    if (!error) return null;
    const { extraFields } = error;
    if (
      !extraFields?.errorDetails?.errors?.length ||
      extraFields?.errorDetails?.errors?.length === 1
    )
      return 'The below error has occurred:';
    return 'The below errors have occurred:';
  };

  const heading = getHeading();

  const getErrorsToDisplay = () => {
    if (!error) return [];
    const { message, extraFields } = error;
    if (!extraFields?.errorDetails?.errors?.length) return [{ message }];
    return extraFields.errorDetails.errors;
  };

  const errors = getErrorsToDisplay();
  return (
    <Content>
      {isLoading && 'Please be patient, this can take some time...'}
      {error?.message && (
        <>
          <Heading>{heading}</Heading>
          {errors.map(({ message, details }) => (
            <Error key={message} message={message} details={details} />
          ))}
        </>
      )}
      {/* If loading or error message, don't show children */}
      {!isLoading && !error && children}
    </Content>
  );
};

ModalContentProvider.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.object,
  children: PropTypes.node,
};

ModalContentProvider.defaultProps = {
  error: null,
  children: null,
};
