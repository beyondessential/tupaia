import React, { ReactNode } from 'react';
import { Link as RouterLink, To } from 'react-router-dom';
import { Button as UIButton, Tooltip } from '@tupaia/ui-components';
import styled, { css } from 'styled-components';

const StyledButton = styled(UIButton)<{
  $enabledDisabledHoverEvents: boolean;
}>`
  // this is to allow the hover effect of a tooltip to work
  ${props =>
    props.$enabledDisabledHoverEvents &&
    css`
      &.Mui-disabled {
        pointer-events: auto;
      }
    `};
`;

export const TooltipButtonWrapper = styled.span`
  display: flex;
  flex-direction: column;
  vertical-align: baseline;
`;

interface ButtonProps extends React.ComponentPropsWithoutRef<typeof StyledButton> {
  to?: To;
  tooltip?: ReactNode;
  tooltipDelay?: number;
}

const ButtonWrapper = ({
  children,
  tooltip,
  tooltipDelay,
}: {
  children: ReactNode;
  tooltip?: ButtonProps['tooltip'];
  tooltipDelay?: ButtonProps['tooltipDelay'];
}) => {
  if (!tooltip) return <>{children}</>;
  return (
    // Wrap the button in a <span> to suppress console error about tooltips on disabled buttons
    <Tooltip title={tooltip} arrow enterDelay={tooltipDelay}>
      <TooltipButtonWrapper>{children}</TooltipButtonWrapper>
    </Tooltip>
  );
};
export const Button = ({ tooltip, to, tooltipDelay = 1000, ...props }: ButtonProps) => {
  return (
    <ButtonWrapper tooltip={tooltip} tooltipDelay={tooltipDelay}>
      <StyledButton
        {...props}
        component={to ? RouterLink : undefined}
        to={to}
        $enabledDisabledHoverEvents={!!tooltip}
      />
    </ButtonWrapper>
  );
};
