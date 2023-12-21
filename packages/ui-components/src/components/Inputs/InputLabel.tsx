/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ComponentType } from 'react';
import { InfoOutlined } from '@material-ui/icons';
import styled from 'styled-components';
import { Tooltip as BaseTooltip } from '../Tooltip';

/** Styled label for inputs. Handles tooltips for labels if present. */
const LabelWrapper = styled.span`
  display: flex;
  align-items: center;
`;

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
    svg {
      fill: ${props => props.theme.palette.primary.main};
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

interface InputLabelProps {
  label?: string | React.ReactNode;
  tooltip?: string;
  as?: string | ComponentType<any>;
  className?: string;
  htmlFor?: string;
}

export const InputLabel = ({
  label,
  tooltip,
  as = 'label',
  className,
  htmlFor,
}: InputLabelProps) => {
  // If no label, don't render anything, so there isn't an empty label tag in the DOM
  if (!label) return null;
  return (
    // allows us to pass in a custom element to render as, e.g. a span if it is going to be contained in a label element, for example when using MUI's TextField component. Otherwise defaults to a label element so that it can be a standalone label
    <LabelWrapper as={as} className={className} htmlFor={htmlFor}>
      {label}
      {tooltip && (
        <Tooltip title={tooltip} placement="top">
          <TooltipWrapper tabIndex={0}>
            <InfoOutlined />
          </TooltipWrapper>
        </Tooltip>
      )}
    </LabelWrapper>
  );
};
