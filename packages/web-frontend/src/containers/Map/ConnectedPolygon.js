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
import { changeOrgUnit, highlightOrgUnit } from '../../actions';
import { getMeasureAsShade } from '../../utils';
import { selectMeasureName } from '../../reducers/mapReducers';
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

const ShadedPolygon = styled(Polygon)`
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
    const { isHighlighted, measureInfo, highlightedOrganisationUnit, area, regions } = this.props;
    const { organisationUnitCode } = area;
    if (nextProps.highlightedOrganisationUnit !== highlightedOrganisationUnit) return true;
    if (nextProps.isHighlighted !== isHighlighted) return true;
    if (nextProps.measureInfo.measureId !== measureInfo.measureId) return true;
    if (regions[organisationUnitCode] !== nextProps.regions[organisationUnitCode]) return true;
    return false;
  }

  getTooltip(organisationUnitCode, area) {
    const { measureInfo, measureName, highlightedOrganisationUnit, isChildArea } = this.props;
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

    const hasMeasureInfo = measureInfo.measureData && measureInfo.measureData.length > 0;

    // don't render tooltips if we have a measure loaded
    return hasMeasureInfo ? null : (
      <AreaTooltip
        highlight={highlight}
        permanent={isChildArea}
        onFocus={() => highlightOrgUnit(area)}
        onBlur={() => highlightOrgUnit()}
        onMouseOver={() => highlightOrgUnit(area)}
        onMouseOut={() => highlightOrgUnit()}
        text={area.name}
      />
    );
  }

  render() {
    const { measureInfo, onChangeOrgUnit, area, isActive, regions } = this.props;
    const { organisationUnitCode, organisationUnitChildren } = area;
    const tooltip = this.getTooltip(organisationUnitCode, area);

    const region = regions[organisationUnitCode] || {};
    const coordinates = region.coordinates;
    if (!coordinates) return null;

    if (isActive) {
      const measureShade = getMeasureAsShade(organisationUnitCode, measureInfo);
      const hasChildren = organisationUnitChildren && organisationUnitChildren.length > 0;
      // Check if first child is shaded - this is safe to use as a stand-in for the
      // whole set of children as we don't have a case where some regions in a country (or
      // some districts in a province) are included in a dataset but some aren't. (of course
      // some org units will have "no data" but that still counts as shaded)
      const hasShadedChildren =
        hasChildren &&
        getMeasureAsShade(organisationUnitChildren[0].organisationUnitCode, measureInfo);

      return (
        <ActivePolygon
          shade={measureShade}
          areChildrenShaded={hasShadedChildren}
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
      onFocus: () => highlightOrgUnit(area),
      onBlur: () => highlightOrgUnit(),
      onMouseOver: () => highlightOrgUnit(area),
      onMouseOut: () => highlightOrgUnit(),
      onClick: () => onChangeOrgUnit(organisationUnitCode),
    };

    const measureShade = getMeasureAsShade(organisationUnitCode, measureInfo);
    if (measureShade) {
      // Work around: color should go through the styled components
      // but there is a rendering bug between Styled Components + Leaflet
      return <ShadedPolygon {...defaultProps} color={measureShade} />;
    }

    return <BasicPolygon {...defaultProps}>{tooltip}</BasicPolygon>;
  }
}

ConnectedPolygon.propTypes = {
  area: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  measureInfo: PropTypes.shape({
    measureData: PropTypes.array,
    measureOptions: PropTypes.array,
  }).isRequired,
  highlightedOrganisationUnit: PropTypes.shape({
    type: PropTypes.string,
    organisationUnitCode: PropTypes.string,
  }).isRequired,
  measureName: PropTypes.string,
  isActive: PropTypes.bool,
  isChildArea: PropTypes.bool,
  onChangeOrgUnit: PropTypes.func,
  highlightOrgUnit: PropTypes.func,
  regions: PropTypes.shape({}).isRequired,
  isHighlighted: PropTypes.bool,
};

ConnectedPolygon.defaultProps = {
  isActive: false,
  isHighlighted: false,
  isChildArea: false,
  highlightOrgUnit: () => {},
  onChangeOrgUnit: () => {},
  measureName: '',
};

const mapStateToProps = state => {
  const { measureInfo, regions } = state.map;

  const {
    highlightedOrganisationUnit,
    currentOrganisationUnit,
    currentOrganisationUnitSiblings,
  } = state.global;
  return {
    measureInfo,
    measureName: selectMeasureName(state),
    highlightedOrganisationUnit,
    currentOrganisationUnit,
    currentOrganisationUnitSiblings,
    regions,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(changeOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
  highlightOrgUnit: organisationUnitCode => dispatch(highlightOrgUnit(organisationUnitCode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedPolygon);
