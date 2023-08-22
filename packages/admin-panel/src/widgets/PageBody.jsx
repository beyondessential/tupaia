/**
 * Tupaia Admin
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import PropTypes from 'prop-types';

const MinHeightContainer = styled(MuiContainer)`
  min-height: 400px;
`;

export const PageBody = ({ children, className }) => (
  <MinHeightContainer className={className} maxWidth="xl">
    {children}
  </MinHeightContainer>
);

PageBody.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

PageBody.defaultProps = {
  children: null,
  className: '',
};
