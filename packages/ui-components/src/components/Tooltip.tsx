/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
    color: white;
    border-radius: 3px;
    font-size: 0.75rem;
    line-height: 1rem;
    padding: 0.55rem 1rem 0.6rem;
    letter-spacing: 0.4px;

    .MuiTooltip-arrow {
      color: ${({ theme }) => theme.palette.tooltip || TOOLTIP_COLOR};
    }
  }
`;
