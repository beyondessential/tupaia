import React from 'react';
import styled from 'styled-components';
import { Button } from 'semantic-ui-react';

const StyledButton = styled(Button)`
  border-radius: 0;
`;

export const SuiButton = ({ children, isSubmitting = false, disabled, ...props }) => {
  return (
    <StyledButton {...props} disabled={isSubmitting}>
      {isSubmitting ? 'Loading...' : children}
    </StyledButton>
  );
};

export const SuiPrimaryButton = ({ children }) => <StyledButton primary>{children}</StyledButton>;

export const SuiSecondaryButton = ({ children }) => (
  <StyledButton secondary>{children}</StyledButton>
);
