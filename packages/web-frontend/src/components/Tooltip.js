/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTooltip from '@material-ui/core/Tooltip';

// extend popper styles as a work around for custom styling
// https://github.com/mui-org/material-ui/issues/11467
export const Tooltip = styled(({ placement, ...props }) => (
  <MuiTooltip classes={{ popper: props.className }} placement={placement} arrow {...props} />
))`
  & .MuiTooltip-tooltip {
    background: black;
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1rem;
    letter-spacing: 0;

    .MuiTooltip-arrow {
      color: black;
    }
  }
`;

Tooltip.propTypes = {
  placement: PropTypes.string,
};

// For placement options @see https://material-ui.com/api/tooltip
Tooltip.defaultProps = {
  placement: 'top',
};
