/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ComponentType } from 'react';
import { InfoOutlined } from '@material-ui/icons';
import styled from 'styled-components';
import { Tooltip as BaseTooltip } from './Tooltip';

const TooltipWrapper = styled.span`
  pointer-events: auto;
  cursor: pointer;
  margin-left: 0.4em;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  height: 100%;
  width: 1rem;
  svg {
    height: 100%;
    width: 100%;
  }
  &:hover,
  &:focus {
    ${({ theme }) => theme.breakpoints.up('md')} {
      svg {
        fill: ${props => props.theme.palette.primary.main};
      }
    }
  }
`;

const Tooltip = styled(BaseTooltip)`
  & .MuiTooltip-tooltip {
    background-color: ${props => props.theme.palette.text.primary};
    border-radius: 3px;
    font-weight: ${props => props.theme.typography.fontWeightRegular};
    font-size: 0.69rem;
    .MuiTooltip-arrow {
      color: ${props => props.theme.palette.text.primary};
    }
  }
`;

interface TooltipIconButtonProps {
  tooltip: string;
  Icon?: ComponentType<any>;
}

export const TooltipIconButton = ({ tooltip, Icon = InfoOutlined }: TooltipIconButtonProps) => {
  return (
    <Tooltip title={tooltip} placement="top" enterTouchDelay={500}>
      <TooltipWrapper tabIndex={0} className="tooltip-icon">
        <Icon />
      </TooltipWrapper>
    </Tooltip>
  );
};
