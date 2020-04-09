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
const ActivePolygon = ({ coordinates, shade, areChildrenShaded }) => (
  <StyledPolygon positions={coordinates} shade={shade} areChildrenShaded={areChildrenShaded} />
);

ActivePolygon.propTypes = {
  coordinates: PropTypes.array.isRequired,
  shade: PropTypes.string,
  areChildrenShaded: PropTypes.bool,
};

ActivePolygon.defaultProps = {
  shade: null,
  areChildrenShaded: false,
};

export default ActivePolygon;
