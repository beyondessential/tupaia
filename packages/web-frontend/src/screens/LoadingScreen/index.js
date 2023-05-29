/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import CircularProgress from 'material-ui/CircularProgress';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Screen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  background: ${props => props.$background};
  align-items: center;
  justify-content: center;
  z-index: ${Number.MAX_SAFE_INTEGER};
`;

export const LoadingScreen = ({ isLoading, background }) =>
  isLoading ? (
    <Screen $background={background}>
      <CircularProgress />
    </Screen>
  ) : null;

LoadingScreen.propTypes = {
  isLoading: PropTypes.bool,
  background: PropTypes.string,
};

LoadingScreen.defaultProps = {
  isLoading: false,
  background: 'rgba(0, 0, 0, 0.5)',
};
