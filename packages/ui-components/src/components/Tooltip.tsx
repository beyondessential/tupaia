import React from 'react';
import styled from 'styled-components';
import MuiTooltip, { TooltipProps } from '@material-ui/core/Tooltip';

const TOOLTIP_COLOR = '#002d47';

// extend popper styles as a work around for custom styling
// https://github.com/mui-org/material-ui/issues/11467

// For placement options @see https://material-ui.com/api/tooltip
export const Tooltip = styled(
  ({ className, placement = 'top', enterDelay, enterTouchDelay = 10, ...props }: TooltipProps) => (
    <MuiTooltip
      {...props}
      classes={{ popper: className }}
      placement={placement}
      enterDelay={enterDelay}
      enterNextDelay={enterDelay}
      enterTouchDelay={enterTouchDelay}
      arrow
    />
  ),
)`
  & .MuiTooltip-tooltip {
    background-color: ${({ theme }) => theme.palette.tooltip || TOOLTIP_COLOR};
    border-radius: 0.1875rem;
    color: white;
    font-size: 0.75rem;
    letter-spacing: 0.03em;
    line-height: 1.35;
    padding-block: 0.55rem 0.6rem;
    padding-inline: 1rem;

    .MuiTooltip-arrow {
      color: ${({ theme }) => theme.palette.tooltip || TOOLTIP_COLOR};
    }
  }
`;
