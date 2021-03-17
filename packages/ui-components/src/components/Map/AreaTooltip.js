/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-leaflet';

export const AreaTooltip = React.memo(({ permanent, onMouseOver, onMouseOut, text, sticky }) => (
  <Tooltip
    pane="tooltipPane"
    direction="auto"
    opacity={1}
    sticky={sticky}
    permanent={permanent}
    interactive={false}
    onMouseOver={onMouseOver}
    onFocus={onMouseOver}
    onMouseOut={onMouseOut}
    onBlur={onMouseOut}
  >
    <span>{text}</span>
  </Tooltip>
));

AreaTooltip.propTypes = {
  permanent: PropTypes.bool,
  sticky: PropTypes.bool,
  text: PropTypes.string.isRequired,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
};

AreaTooltip.defaultProps = {
  permanent: false,
  sticky: false,
  onMouseOver: undefined,
  onMouseOut: undefined,
};
