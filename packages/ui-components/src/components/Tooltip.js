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
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 0;
    font-size: 0.75rem;
    line-height: 1rem;
    padding: 0.55rem 1rem 0.6rem;
    letter-spacing: 0.4px;

    .MuiTooltip-arrow {
      color: rgba(0, 0, 0, 0.7);
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
