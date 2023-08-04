/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import PropTypes from 'prop-types';

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => (props.showBackground ? 'rgba(255, 255, 255, 0.5)' : 'transparent')};
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const LoadingIndicator = ({ showBackground }) => (
  <LoadingOverlay showBackground={showBackground}>
    <CircularProgress />
  </LoadingOverlay>
);

LoadingIndicator.propTypes = {
  showBackground: PropTypes.bool,
};
LoadingIndicator.defaultProps = {
  showBackground: true,
};
