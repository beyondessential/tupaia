/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';

const StyledButton = styled(MuiButton)`
  padding: 0.5rem 1.5rem;
  min-width: 120px;
`;

export const Button = ({ children, isSubmitting = false, disabled, ...props }) => (
  <StyledButton
    classes={{ disabled: 'test' }}
    variant="contained"
    color="primary"
    {...props}
    disabled={isSubmitting}
  >
    {isSubmitting ? 'Loading...' : children}
  </StyledButton>
);
