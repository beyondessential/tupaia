/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ComponentType } from 'react';
import { HelpOutline } from '@material-ui/icons';
import { FormLabel } from '@material-ui/core';
import styled from 'styled-components';
import { Tooltip as BaseTooltip } from '../Tooltip';
import { FlexCenter } from '../Layout';

/** Styled label for inputs. Handles tooltips for labels if present. */
const Label = styled.span``;

const TooltipWrapper = styled.span`
  pointer-events: auto;
  cursor: pointer;
  margin-left: auto; // push to the right
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  height: 100%;
  width: 1rem;
  order: 3;
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
    color: ${props => props.theme.palette.background.paper};
    border-radius: 3px;
    font-weight: ${props => props.theme.typography.fontWeightRegular};
    font-size: 0.69rem;
    .MuiTooltip-arrow {
      color: ${props => props.theme.palette.text.primary};
    }
  }
`;

const LabelWrapper = styled(FlexCenter)`
  margin-block-end: 0.25rem;
  justify-content: space-between;
  width: 100%;
`;

interface InputLabelProps {
  label?: React.ReactNode;
  tooltip?: string;
  as?: string | ComponentType<any>;
  className?: string;
  htmlFor?: string;
  TooltipIcon?: ComponentType<any>;
  applyWrapper?: boolean;
  labelProps?: Record<string, unknown>;
}

export const InputLabel = ({
  label,
  tooltip,
  as = FormLabel,
  className,
  htmlFor,
  labelProps = {},
  TooltipIcon = HelpOutline,
  applyWrapper = false,
}: InputLabelProps) => {
  // If no label, don't render anything, so there isn't an empty label tag in the DOM
  if (!label) return null;

  // Wrapper won’t work correctly when using TextField, so we need to conditionally apply it
  const Wrapper = applyWrapper ? LabelWrapper : React.Fragment;
  return (
    // Allows us to pass in a custom element to render as, e.g. a span if it is going to be
    // contained in a label element, for example when using MUI's TextField component. Otherwise
    // defaults to a label element so that it can be a standalone label
    <Wrapper>
      <Label as={as} className={className} htmlFor={htmlFor} {...labelProps}>
        {label}
      </Label>
      {tooltip && (
        <Tooltip title={tooltip} placement="top">
          <TooltipWrapper tabIndex={0}>
            <TooltipIcon className="tooltip" />
          </TooltipWrapper>
        </Tooltip>
      )}
    </Wrapper>
  );
};
