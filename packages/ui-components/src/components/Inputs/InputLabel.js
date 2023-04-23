/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { InfoOutlined } from '@material-ui/icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Tooltip } from '../Tooltip';

/** Styled label for inputs. Handles tooltips for labels if present. */

const LabelWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const TooltipWrapper = styled.span`
  pointer-events: auto;
  cursor: pointer;
  margin-left: 0.5em;
  height: 1.4em;
  border: 1px solid transparent;
  svg {
    height: 100%;
    width: 100%;
  }
  &:hover {
    border-color: ${props => props.theme.palette.text.secondary};
  }
`;

export const InputLabel = ({ label, tooltip, as }) => {
  // If no label, don't render anything, so there isn't an empty label tag in the DOM
  if (!label) return null;
  return (
    // allows us to pass in a custom element to render as, e.g. a span if it is going to be contained in a label element, for example when using MUI's TextField component. Otherwise defaults to a label element so that it can be a standalone label
    <LabelWrapper as={as}>
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

InputLabel.propTypes = {
  label: PropTypes.string,
  tooltip: PropTypes.string,
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

InputLabel.defaultProps = {
  label: '',
  tooltip: '',
  as: 'label',
};
