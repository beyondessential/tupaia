/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SmallAlert } from '@tupaia/ui-components';
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
  margin-bottom: 18px;
`;

export const ModalContentProvider = ({ isLoading, errorMessage, children }) => {
  return (
    <Content>
      {isLoading && 'Please be patient, this can take some time...'}
      {!!errorMessage && (
        <>
          <Heading variant="h6">An error has occurred.</Heading>
          <SmallAlert severity="error" variant="standard">
            {errorMessage}
          </SmallAlert>
        </>
      )}
      {/* If loading or error message, don't show children */}
      {!isLoading && !errorMessage && children}
    </Content>
  );
};

ModalContentProvider.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  children: PropTypes.node,
};

ModalContentProvider.defaultProps = {
  errorMessage: null,
  children: null,
};
