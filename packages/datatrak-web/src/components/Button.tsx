/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactElement, ReactNode } from 'react';
import { To, Link as RouterLink } from 'react-router-dom';
import { Tooltip, Button as UIButton } from '@tupaia/ui-components';
import styled from 'styled-components';

const StyledButton = styled(UIButton)`
  &.Mui-disabled {
    pointer-events: auto; // this is to allow the hover effect of a tooltip to work
    &.MuiButton-containedPrimary {
      opacity: 0.3; // overrides styles explicitly set in ui-components
    }
  }
`;

interface ButtonProps extends Record<string, any> {
  tooltip?: string;
  children?: ReactNode;
  to?: To;
}

const ButtonWrapper = ({
  children,
  tooltip,
}: {
  children: ReactElement<any, any>;
  tooltip?: ButtonProps['tooltip'];
}) => {
  if (!tooltip) return children;
  return (
    <Tooltip title={tooltip} arrow enterDelay={1000}>
      {children}
    </Tooltip>
  );
};
export const Button = ({ tooltip, children, to = {}, ...restOfProps }: ButtonProps) => {
  return (
    <ButtonWrapper tooltip={tooltip}>
      <StyledButton {...restOfProps} component={to ? RouterLink : undefined} to={to}>
        {children}
      </StyledButton>
    </ButtonWrapper>
  );
};
