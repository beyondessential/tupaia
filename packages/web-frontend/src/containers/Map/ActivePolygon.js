/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Polygon } from 'react-leaflet';
import styled from 'styled-components';
import { MAP_COLORS } from '../../styles';

const { POLYGON_HIGHLIGHT } = MAP_COLORS;
const StyledPolygon = styled(Polygon)`
  stroke: ${props => props.shade || POLYGON_HIGHLIGHT};
  opacity: 1;
  fill: ${props => props.shade || 'none'};
  pointer-events: ${props => (props.hasChildren ? 'none !important' : 'auto')} 
  stroke-width: ${props => {
    let weight = 2;
    if (props.areChildrenShaded) weight = 0;
    else if (props.shade) weight = 3;
    return weight;
  }};
`;

/**
 * ActivePolygon: The polygon that is selected on the map. This handles the style logic
 */
const ActivePolygon = ({ coordinates, shade, hasChildren, hasShadedChildren }) => (
  <StyledPolygon
    positions={coordinates}
    shade={shade}
    hasChildren={hasChildren}
    hasShadedChildren={hasShadedChildren}
  />
);

ActivePolygon.propTypes = {
  coordinates: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  ).isRequired,
  shade: PropTypes.string,
  hasChildren: PropTypes.bool,
  hasShadedChildren: PropTypes.bool,
};

ActivePolygon.defaultProps = {
  shade: null,
  hasChildren: false,
  hasShadedChildren: false,
};

export default ActivePolygon;
