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
import { setOrgUnit } from '../../actions';
import {
  selectOrgUnit,
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
  selectCurrentMeasureId,
  selectOrgUnitChildren,
  selectAreRegionLabelsPermanent,
} from '../../selectors';
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

export const TransparentShadedPolygon = styled(Polygon)`
  fill: ${POLYGON_BLUE};
  fill-opacity: 0;
  :hover {
    fill-opacity: 0.1;
  }
`;

/**
 * ConnectedPolygon: Polygons defined by coordinates on the map. The logic here
 * deals with shading or default styling when it is being used to represent a
 * measure
 */
class ConnectedPolygon extends Component {
  shouldComponentUpdate(nextProps) {
    const { measureId, coordinates, orgUnitMeasureData, isHidden } = this.props;
    if (nextProps.measureId !== measureId) return true;
    if (nextProps.coordinates !== coordinates) return true;
    if (nextProps.orgUnitMeasureData !== orgUnitMeasureData) return true;
    if (isHidden !== nextProps.isHidden) return true;
    return false;
  }

  getTooltip() {
    const {
      isChildArea,
      area,
      hasMeasureData,
      orgUnitMeasureData,
      measureOptions,
      permanentLabels,
    } = this.props;
    const hasMeasureValue = !!(orgUnitMeasureData || orgUnitMeasureData === 0);

    // don't render tooltips if we have a measure loaded
    // and don't have a value to display in the tooltip (ie: radius overlay)
    if (hasMeasureData && !hasMeasureValue) return null;

    return (
      <AreaTooltip
        permanent={permanentLabels && isChildArea && !hasMeasureValue}
        sticky={!permanentLabels}
        hasMeasureValue={hasMeasureValue}
        measureOptions={measureOptions}
        orgUnitMeasureData={orgUnitMeasureData}
        orgUnitName={area.name}
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
      isHidden,
      hasChildren,
      hasShadedChildren,
    } = this.props;
    if (isHidden) return null;

    const { organisationUnitCode } = area;
    const tooltip = this.getTooltip();

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
      if (shade === 'transparent') {
        return <TransparentShadedPolygon {...defaultProps}>{tooltip}</TransparentShadedPolygon>;
      }

      // To match with the color in markerIcon.js which uses BREWER_PALETTE
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
    organisationUnitCode: PropTypes.string,
  }).isRequired,
  measureId: PropTypes.string,
  isActive: PropTypes.bool,
  permanentLabels: PropTypes.bool,
  isChildArea: PropTypes.bool,
  onChangeOrgUnit: PropTypes.func,
  coordinates: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))),
  ),
  hasMeasureData: PropTypes.bool,
  measureOptions: PropTypes.arrayOf(PropTypes.object),
  hasChildren: PropTypes.bool,
  hasShadedChildren: PropTypes.bool,
  shade: PropTypes.string,
  isHidden: PropTypes.bool,
  orgUnitMeasureData: PropTypes.shape({
    value: PropTypes.any,
    originalValue: PropTypes.any,
    metadata: PropTypes.any,
    submissionDate: PropTypes.any,
  }),
};

ConnectedPolygon.defaultProps = {
  measureId: '',
  isActive: false,
  permanentLabels: true,
  isChildArea: false,
  onChangeOrgUnit: () => {},
  coordinates: undefined,
  hasMeasureData: false,
  measureOptions: [],
  hasChildren: false,
  hasShadedChildren: false,
  shade: undefined,
  isHidden: false,
  orgUnitMeasureData: undefined,
};

const mapStateToProps = (state, givenProps) => {
  const { organisationUnitCode } = givenProps.area;
  const { measureData, measureOptions } = state.map.measureInfo;
  const measureId = selectCurrentMeasureId(state);
  const organisationUnitChildren = selectOrgUnitChildren(state, organisationUnitCode);

  let shade;
  let isHidden;
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
      if (orgUnitMeasureData) {
        shade = orgUnitMeasureData.color;
        isHidden = orgUnitMeasureData.isHidden;
      }
    }
  }

  const orgUnit = selectOrgUnit(state, organisationUnitCode);
  const coordinates = orgUnit ? orgUnit.location.region : undefined;

  return {
    permanentLabels: selectAreRegionLabelsPermanent(state),
    measureId,
    coordinates,
    hasShadedChildren,
    orgUnitMeasureData,
    shade,
    isHidden,
    measureOptions,
    hasChildren: organisationUnitChildren && organisationUnitChildren.length > 0,
    hasMeasureData: measureData && measureData.length > 0,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedPolygon);
