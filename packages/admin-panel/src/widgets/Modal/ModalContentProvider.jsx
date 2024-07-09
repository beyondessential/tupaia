/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SmallAlert, TooltipIconButton } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import HelpOutline from '@material-ui/icons/HelpOutline';
import PropTypes from 'prop-types';
import { DialogContent } from '@material-ui/core';
import * as COLORS from '../../theme/colors';

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
  width: 100%;
`;

const AlertWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  & + & {
    margin-block-start: 0.5rem;
  }

  .MuiSvgIcon-root {
    color: ${COLORS.LIGHT_RED};
    margin-block-end: 0.3rem;
  }
  .tooltip-icon:hover {
    svg {
      fill: ${COLORS.RED};
    }
  }
`;

const ErrorsWrapper = styled.div`
  max-width: 25rem;
  margin: 0 auto;
`;

const Error = ({ message, details }) => {
  return (
    <AlertWrapper>
      {details && <TooltipIconButton tooltip={details} Icon={HelpOutline} />}
      <Alert>{message}</Alert>
    </AlertWrapper>
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
        <ErrorsWrapper>
          <Heading>{heading}</Heading>
          {errors.map(({ message, extraFields }) => (
            <Error key={message} message={message} details={extraFields?.details} />
          ))}
        </ErrorsWrapper>
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
