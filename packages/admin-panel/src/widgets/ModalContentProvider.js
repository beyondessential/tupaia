/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { DialogContent, SmallAlert } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';

const Content = styled(DialogContent)`
  text-align: left;
  min-height: 220px;
`;

const Heading = styled(Typography)`
  margin-bottom: 18px;
`;

const StyledAlert = styled(SmallAlert)`
  &.MuiAlert-standardWarning {
    color: #8b6e37;
    background: #fcf8e2;
    border: 1px solid #faecca;

    .MuiAlert-icon {
      color: #8b6e37;
    }
  }
`;

export const ModalContentProvider = ({
  isLoading,
  errorMessage,
  warningMessage,
  children,
  severity,
}) => {
  const message = errorMessage || warningMessage;
  const header = severity === 'error' ? 'An error has occurred.' : 'Warning';

  return (
    <Content>
      {isLoading && 'Please be patient, this can take some time...'}
      {!!message && (
        <>
          <Heading variant="h6">{header}</Heading>
          <StyledAlert severity={severity} variant="standard">
            {message}
          </StyledAlert>
        </>
      )}
      <span style={isLoading || !!message ? { display: 'none' } : {}}>{children}</span>
    </Content>
  );
};

ModalContentProvider.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  warningMessage: PropTypes.string,
  severity: PropTypes.string,
  children: PropTypes.node,
};

ModalContentProvider.defaultProps = {
  errorMessage: null,
  warningMessage: null,
  children: null,
  severity: 'error',
};
