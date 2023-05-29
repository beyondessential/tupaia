/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import CircularProgress from 'material-ui/CircularProgress';

const loadingScreenStyle = {
  height: '100vh',
  width: '100vw',
  display: 'flex',
  background: 'rgba(0, 0, 0, 0.5)',
  position: 'fixed',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: Number.MAX_SAFE_INTEGER, // top top top
};

export const LoadingScreen = ({ isLoading }) =>
  isLoading ? (
    <div style={loadingScreenStyle}>
      <CircularProgress />
    </div>
  ) : null;
