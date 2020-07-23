/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Polygon } from 'react-leaflet';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { AreaTooltip } from './AreaTooltip';
import { MAP_COLORS, BREWER_PALETTE } from '../../styles';
import { changeOrgUnit } from '../../actions';
import {
  selectOrgUnit,
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
} from '../../selectors';
import ActivePolygon from './ActivePolygon';
import { getSingleFormattedValue } from '../../utils';

const { POLYGON_BLUE, POLYGON_HIGHLIGHT } = MAP_COLORS;

const BasicPolygon = styled(Polygon)`
  fill: ${POLYGON_BLUE};
  fill-opacity: 0.04;
  stroke-width: 1;
  :hover {
    fill-opacity: 0.5;
    stroke: ${POLYGON_HIGHLIGHT};
    fill: ${POLYGON_HIGHLIGHT};
  }
`;

export const ShadedPolygon = styled(Polygon)`
  weight: 1;
  fill-opacity: 0.5;
  :hover {
    fill-opacity: 0.8;
  }
`;

/**
 * ConnectedPolygon: Polygons defined by coordinates on the map. The logic here
 * deals with shading or default styling when it is being used to represent a
 * measure
 */
class ConnectedPolygon extends Component {
  shouldComponentUpdate(nextProps) {
    const { measureId, coordinates } = this.props;
    if (nextProps.measureId !== measureId) return true;
    if (coordinates !== nextProps.coordinates) return true;
    return false;
  }

  getTooltip(name) {
    const { isChildArea, hasMeasureData, orgUnitMeasureData, measureOptions } = this.props;
    const hasMeasureValue = orgUnitMeasureData || orgUnitMeasureData === 0;

    // don't render tooltips if we have a measure loaded
    // and don't have a value to display in the tooltip (ie: radius overlay)
    if (hasMeasureData && !hasMeasureValue) return null;

    const text = hasMeasureValue
      ? `${name}: ${getSingleFormattedValue(orgUnitMeasureData, measureOptions)}`
      : name;

    return <AreaTooltip permanent={isChildArea && !hasMeasureValue} text={text} />;
  }

  render() {
    const {
      onChangeOrgUnit,
      area,
      isActive,
      coordinates,
      shade,
      hasChildren,
      hasShadedChildren,
    } = this.props;
    const { organisationUnitCode } = area;
    const tooltip = this.getTooltip(area.name);

    if (!coordinates) return null;

    if (isActive) {
      return (
        <ActivePolygon
          shade={shade}
          hasChildren={hasChildren}
          hasShadedChildren={hasShadedChildren}
          coordinates={coordinates}
          // Randomize key to ensure polygon appears at top. This is still imporatant even
          // though the polygon is in a LayerGroup due to issues with react-leaflet that
          // maintainer says are out of scope for the module.
          key={`currentOrgUnitPolygon${Math.random()}`}
        />
      );
    }

    const defaultProps = {
      positions: coordinates,
      onClick: () => onChangeOrgUnit(organisationUnitCode),
    };

    if (shade) {
      //To match with the color in markerIcon.js which uses BREWER_PALETTE
      const color = BREWER_PALETTE[shade] || shade;

      // Work around: color should go through the styled components
      // but there is a rendering bug between Styled Components + Leaflet
      return (
        <ShadedPolygon {...defaultProps} color={color}>
          {tooltip}
        </ShadedPolygon>
      );
    }

    return <BasicPolygon {...defaultProps}>{tooltip}</BasicPolygon>;
  }
}

ConnectedPolygon.propTypes = {
  area: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  measureId: PropTypes.string,
  isActive: PropTypes.bool,
  isChildArea: PropTypes.bool,
  onChangeOrgUnit: PropTypes.func,
  coordinates: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  ),
  hasMeasureData: PropTypes.bool,
  hasChildren: PropTypes.bool,
  hasShadedChildren: PropTypes.bool,
  shade: PropTypes.string,
  orgUnitMeasureData: PropTypes.shape({
    value: PropTypes.any,
    originalValue: PropTypes.any,
  }),
  measureOptions: PropTypes.arrayOf(PropTypes.object),
};

ConnectedPolygon.defaultProps = {
  measureId: '',
  isActive: false,
  isChildArea: false,
  onChangeOrgUnit: () => {},
  coordinates: undefined,
  hasMeasureData: false,
  hasChildren: false,
  hasShadedChildren: false,
  shade: undefined,
  orgUnitMeasureData: undefined,
  measureOptions: undefined,
};

const mapStateToProps = (state, givenProps) => {
  const { organisationUnitCode, organisationUnitChildren } = givenProps.area;
  const { measureId, measureData, measureOptions } = state.map.measureInfo;

  let shade;
  let orgUnitMeasureData;
  let hasShadedChildren = false;
  if (selectHasPolygonMeasure(state)) {
    const measureOrgUnits = selectAllMeasuresWithDisplayInfo(state);
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);

    hasShadedChildren =
      organisationUnitChildren &&
      organisationUnitChildren.some(child =>
        measureOrgUnitCodes.includes(child.organisationUnitCode),
      );

    if (measureOrgUnitCodes.includes(organisationUnitCode)) {
      orgUnitMeasureData = measureOrgUnits.find(
        orgUnit => orgUnit.organisationUnitCode === organisationUnitCode,
      );
    }

    shade = (orgUnitMeasureData || {}).color;
  }

  const orgUnit = selectOrgUnit(state, organisationUnitCode);
  const coordinates = orgUnit ? orgUnit.location.region : undefined;

  return {
    measureId,
    coordinates,
    hasShadedChildren,
    orgUnitMeasureData,
    shade,
    measureOptions,
    hasChildren: organisationUnitChildren && organisationUnitChildren.length > 0,
    hasMeasureData: measureData && measureData.length > 0,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(changeOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedPolygon);
