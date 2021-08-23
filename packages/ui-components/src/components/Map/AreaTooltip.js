/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-leaflet';

export const AreaTooltip = React.memo(({ permanent, text, sticky }) => (
  <Tooltip
    pane="tooltipPane"
    direction="auto"
    opacity={1}
    sticky={sticky}
    permanent={permanent}
    interactive={false}
  >
    <span>{text}</span>
  </Tooltip>
));

AreaTooltip.propTypes = {
  permanent: PropTypes.bool,
  sticky: PropTypes.bool,
  text: PropTypes.string.isRequired,
};

AreaTooltip.defaultProps = {
  permanent: false,
  sticky: false,
};
