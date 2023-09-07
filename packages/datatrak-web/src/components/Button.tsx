/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode, Fragment } from 'react';
import { To, Link as RouterLink } from 'react-router-dom';
import { Tooltip, Button as UIButton } from '@tupaia/ui-components';
import styled from 'styled-components';

const StyledButton = styled(UIButton)`
  &.Mui-disabled {
    pointer-events: auto; // this is to allow the hover effect of a tooltip to work
  }
`;

interface ButtonProps extends Record<string, any> {
  tooltip?: string;
  children?: ReactNode;
  to?: To;
}
export const Button = ({ tooltip, children, to, ...restOfProps }: ButtonProps) => {
  const Wrapper = tooltip ? Tooltip : Fragment;

  return (
    <Wrapper title={tooltip!} arrow>
      <StyledButton component={to ? RouterLink : undefined} to={to} {...restOfProps}>
        {children}
      </StyledButton>
    </Wrapper>
  );
};
