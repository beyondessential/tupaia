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
import { MAP_COLORS } from '../../styles';
import { HIGHLIGHT_TYPES } from './constants';
import { changeOrgUnit } from '../../actions';
import {
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
} from '../../reducers/mapReducers';
import { selectOrgUnit } from '../../reducers/orgUnitReducers';
import ActivePolygon from './ActivePolygon';

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
    const { isHighlighted, measureId, highlightedOrganisationUnit, coordinates } = this.props;
    if (nextProps.highlightedOrganisationUnit !== highlightedOrganisationUnit) return true;
    if (nextProps.isHighlighted !== isHighlighted) return true;
    if (nextProps.measureId !== measureId) return true;
    if (coordinates !== nextProps.coordinates) return true;
    return false;
  }

  getTooltip(organisationUnitCode, area) {
    const { highlightedOrganisationUnit, isChildArea, hasMeasureData, measureValue } = this.props;
    const highlightedCode = highlightedOrganisationUnit.organisationUnitCode;
    const getHighlight = code => {
      if (code === highlightedCode) {
        return HIGHLIGHT_TYPES.HIGHLIGHT;
      }
      if (highlightedCode) {
        return HIGHLIGHT_TYPES.LOWLIGHT;
      }
      return HIGHLIGHT_TYPES.NONE;
    };
    const highlight = getHighlight(organisationUnitCode);
    const hasMeasureValue = !!measureValue;

    // don't render tooltips if we have a measure loaded
    return hasMeasureData && !hasMeasureValue ? null : (
      <AreaTooltip
        highlight={highlight}
        permanent={isChildArea && !hasMeasureValue}
        text={`${area.name}${measureValue ? `: ${measureValue}` : ''}`}
      />
    );
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
    const tooltip = this.getTooltip(organisationUnitCode, area);

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
      // Work around: color should go through the styled components
      // but there is a rendering bug between Styled Components + Leaflet
      return (
        <ShadedPolygon {...defaultProps} color={shade}>
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
  highlightedOrganisationUnit: PropTypes.shape({
    type: PropTypes.string,
    organisationUnitCode: PropTypes.string,
  }).isRequired,
  measureId: PropTypes.string,
  isActive: PropTypes.bool,
  isChildArea: PropTypes.bool,
  onChangeOrgUnit: PropTypes.func,
  coordinates: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  ),
  isHighlighted: PropTypes.bool,
  hasMeasureData: PropTypes.bool,
  hasChildren: PropTypes.bool,
  hasShadedChildren: PropTypes.bool,
  shade: PropTypes.string,
  measureValue: PropTypes.string,
};

ConnectedPolygon.defaultProps = {
  measureId: '',
  isActive: false,
  isChildArea: false,
  onChangeOrgUnit: () => {},
  coordinates: undefined,
  isHighlighted: false,
  hasMeasureData: false,
  hasChildren: false,
  hasShadedChildren: false,
  shade: undefined,
  measureValue: undefined,
};

const mapStateToProps = (state, givenProps) => {
  const { organisationUnitCode, organisationUnitChildren } = givenProps.area;
  const { measureId, measureData } = state.map.measureInfo;

  const {
    highlightedOrganisationUnit,
    currentOrganisationUnit,
    currentOrganisationUnitSiblings,
  } = state.global;

  let shade;
  let measureValue;
  let hasShadedChildren = false;
  if (selectHasPolygonMeasure(state)) {
    const measureOrgUnits = selectAllMeasuresWithDisplayInfo(state);
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);

    hasShadedChildren =
      organisationUnitChildren &&
      organisationUnitChildren.some(child =>
        measureOrgUnitCodes.includes(child.organisationUnitCode),
      );

    const orgUnitMeasureData = measureOrgUnitCodes.includes(organisationUnitCode)
      ? measureOrgUnits.find(orgUnit => orgUnit.organisationUnitCode === organisationUnitCode)
      : {};

    shade = orgUnitMeasureData.color;
    measureValue = orgUnitMeasureData.originalValue;
  }

  const orgUnit = selectOrgUnit(state, organisationUnitCode);
  const coordinates = orgUnit ? orgUnit.location.region : undefined;

  return {
    measureId,
    highlightedOrganisationUnit,
    currentOrganisationUnit,
    currentOrganisationUnitSiblings,
    coordinates,
    hasShadedChildren,
    shade,
    measureValue,
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
