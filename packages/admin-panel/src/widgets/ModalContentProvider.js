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
      <span style={isLoading || !!errorMessage ? { display: 'none' } : {}}>{children}</span>
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
