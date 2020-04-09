/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';

const StyledButton = styled(MuiButton)`
  padding: 0.5rem 1.5rem;
  min-width: 120px;
`;

export const Button = ({ children, isSubmitting = false, disabled, ...props }) => (
  <StyledButton variant="contained" color="primary" {...props} disabled={isSubmitting}>
    {isSubmitting ? 'Loading...' : children}
  </StyledButton>
);
