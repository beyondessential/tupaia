/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createSelector } from 'reselect';
import { TileLayer, MarkerLayer, LeafletMap } from '@tupaia/ui-components/lib/map';
import { checkBoundsDifference, organisationUnitIsArea } from '../../utils';
import { DemoLand } from './DemoLand';
import { ConnectedPolygon } from './ConnectedPolygon';
import { DisasterLayer } from './DisasterLayer';
import { ZoomControl } from './ZoomControl';
import {
  selectActiveTileSet,
  selectAllMeasuresWithDisplayInfo,
  selectCurrentOrgUnit,
  selectHasPolygonMeasure,
  selectOrgUnit,
  selectOrgUnitChildren,
  selectOrgUnitSiblings,
  selectRenderedMeasuresWithDisplayInfo,
} from '../../selectors';
import { changePosition, closeDropdownOverlays, setOrgUnit } from '../../actions';
import { TRANS_BLACK, TRANS_BLACK_LESS } from '../../styles';

const CHANGE_TO_PARENT_PERCENTAGE = 0.6;

const StyledMap = styled(LeafletMap)`
  height: 100vh;
  width: 100%;

  .leaflet-control-zoom {
    z-index: 1;
    border: none;
    top: -50px;
    right: 350px;
    transition: right 0.5s ease;

    a {
      background: ${TRANS_BLACK_LESS};
      box-shadow: none;
      border: none;
      color: white;

      &:hover {
        background: ${TRANS_BLACK};
        box-shadow: none;
      }
    }
  }
`;

/**
 * Map
 * Includes basic map setup/rendering, controlled through props that are connected to the redux store.
 * Rendering includes heatmaps markers, polygons.
 */
class MapComponent extends Component {
  componentWillMount() {
    window.addEventListener('resize', () => this.forceUpdate());
  }

  shouldComponentUpdate(nextProps) {
    const {
      currentOrganisationUnit,
      displayedChildren,
      measureInfo,
      measureData,
      position,
      tileSetUrl,
      sidePanelWidth,
    } = this.props;

    if (
      JSON.stringify(nextProps.measureInfo.mapOverlayIds) !==
      JSON.stringify(measureInfo.mapOverlayIds)
    ) {
      return true;
    }

    // Only updates/re-renders when the measure has changed or the orgUnit has changed.
    // These are the only cases where polygons or area tooltips should rerender.
    if (JSON.stringify(nextProps.displayedChildren) !== JSON.stringify(displayedChildren)) {
      return true;
    }

    if (
      nextProps.currentOrganisationUnit?.organisationUnitCode !==
      currentOrganisationUnit?.organisationUnitCode
    ) {
      return true;
    }

    if (nextProps.tileSetUrl !== tileSetUrl) return true;

    if (nextProps.sidePanelWidth !== sidePanelWidth) return true;

    if (JSON.stringify(nextProps.position) !== JSON.stringify(position)) return true;

    if (JSON.stringify(nextProps.measureData) !== JSON.stringify(measureData)) return true;

    return false;
  }

  onPositionChanged = (center, bounds, zoom) => {
    const { position, onChangePosition } = this.props;

    // only check when zooming _out_
    if (zoom < position.zoom) {
      this.checkZoomOutToParentOrgUnit(bounds);
    }

    // Notify redux that we've moved
    onChangePosition(center, zoom);
  };

  checkZoomOutToParentOrgUnit(bounds) {
    const { currentParent, onChangeOrgUnit } = this.props;

    // Maybe we need to zoom out to a parent!
    // First, check if there's a valid parent to zoom out to
    if (currentParent) {
      if (currentParent.location && currentParent.location.bounds) {
        // Now check if we're at a reasonable zoom level to switch to that parent
        const difference = checkBoundsDifference(currentParent.location.bounds, bounds);
        if (difference > CHANGE_TO_PARENT_PERCENTAGE) {
          onChangeOrgUnit(currentParent.organisationUnitCode, false);
        }
      }
    }
  }

  render() {
    const {
      onCloseDropdownOverlays,
      currentOrganisationUnitSiblings,
      currentOrganisationUnit,
      displayedChildren,
      getChildren,
      measureData,
      onChangeOrgUnit,
      measureInfo,
      position,
      shouldSnapToPosition,
      sidePanelWidth,
      tileSetUrl,
    } = this.props;

    const { measureOptions } = measureInfo;

    // Only show data with valid coordinates. Note: this also removes region data
    const processedData = measureData.filter(
      ({ coordinates }) => coordinates && coordinates.length === 2,
    );

    return (
      <StyledMap
        onClick={onCloseDropdownOverlays}
        bounds={position.bounds}
        zoom={position.zoom}
        center={position.center}
        shouldSnapToPosition={shouldSnapToPosition}
        rightPadding={sidePanelWidth}
        onPositionChanged={this.onPositionChanged}
      >
        <TileLayer tileSetUrl={tileSetUrl} />
        <ZoomControl sidePanelWidth={sidePanelWidth} />
        <DemoLand />
        {currentOrganisationUnit && organisationUnitIsArea(currentOrganisationUnit) && (
          <ConnectedPolygon
            area={currentOrganisationUnit}
            organisationUnitChildren={getChildren(currentOrganisationUnit.organisationUnitCode)}
            isActive
          />
        )}
        {displayedChildren?.map(area => (
          <ConnectedPolygon
            area={area}
            key={area.organisationUnitCode}
            organisationUnitChildren={getChildren(area.organisationUnitCode)}
            isChildArea
          />
        ))}
        {currentOrganisationUnitSiblings?.map(area => (
          <ConnectedPolygon
            area={area}
            key={area.organisationUnitCode}
            organisationUnitChildren={getChildren(area.organisationUnitCode)}
          />
        ))}
        <MarkerLayer
          measureData={processedData}
          serieses={measureOptions || null}
          onChangeOrgUnit={onChangeOrgUnit}
        />
        <DisasterLayer />
      </StyledMap>
    );
  }
}

MapComponent.propTypes = {
  onCloseDropdownOverlays: PropTypes.func.isRequired,
  onChangePosition: PropTypes.func.isRequired,
  currentParent: PropTypes.object,
  currentOrganisationUnit: PropTypes.object.isRequired,
  currentOrganisationUnitSiblings: PropTypes.array.isRequired,
  displayedChildren: PropTypes.arrayOf(PropTypes.object),
  getChildren: PropTypes.func.isRequired,
  measureData: PropTypes.array,
  measureInfo: PropTypes.object.isRequired,
  position: PropTypes.shape({
    center: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    bounds: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    zoom: PropTypes.number,
  }).isRequired,
  onChangeOrgUnit: PropTypes.func.isRequired,
  shouldSnapToPosition: PropTypes.bool.isRequired,
  sidePanelWidth: PropTypes.number.isRequired,
  tileSetUrl: PropTypes.string.isRequired,
};

MapComponent.defaultProps = {
  displayedChildren: [],
  measureData: [],
  currentParent: null,
};

const selectMeasureDataWithCoordinates = createSelector([measureData => measureData], measureData =>
  measureData.map(({ location, ...otherData }) => ({
    ...otherData,
    coordinates: location && location.point,
    region: location && location.region,
  })),
);

const mapStateToProps = state => {
  const { isAnimating, shouldSnapToPosition, position, measureInfo } = state.map;
  const { isSidePanelExpanded } = state.global;
  const { contractedWidth, expandedWidth } = state.dashboard;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentParent = selectOrgUnit(state, currentOrganisationUnit.parent);
  const currentChildren =
    selectOrgUnitChildren(state, currentOrganisationUnit.organisationUnitCode) || [];

  // If the org unit's grandchildren are polygons and have a measure, display grandchildren
  // rather than children
  let displayedChildren = currentChildren;
  let measureOrgUnits = [];

  if (selectHasPolygonMeasure(state)) {
    measureOrgUnits = selectAllMeasuresWithDisplayInfo(state);
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);
    const grandchildren = currentChildren
      .map(area => selectOrgUnitChildren(state, area.organisationUnitCode))
      .reduce((acc, val) => acc.concat(val), []); // equivelent to .flat(), for IE

    const hasShadedGrandchildren =
      grandchildren &&
      grandchildren.some(child => measureOrgUnitCodes.includes(child.organisationUnitCode));
    if (hasShadedGrandchildren) displayedChildren = grandchildren;
  }

  const measureData = selectMeasureDataWithCoordinates(
    selectRenderedMeasuresWithDisplayInfo(state),
  );

  const getChildren = organisationUnitCode => selectOrgUnitChildren(state, organisationUnitCode);

  return {
    position,
    currentOrganisationUnit,
    currentParent,
    displayedChildren,
    measureData,
    currentOrganisationUnitSiblings: selectOrgUnitSiblings(
      state,
      currentOrganisationUnit.organisationUnitCode,
    ),
    measureInfo,
    getChildren,
    measureOrgUnits,
    tileSetUrl: selectActiveTileSet(state).url,
    isAnimating,
    shouldSnapToPosition,
    sidePanelWidth: isSidePanelExpanded ? expandedWidth : contractedWidth,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
  onChangePosition: (center, zoom) => dispatch(changePosition(center, zoom)),
  onCloseDropdownOverlays: () => dispatch(closeDropdownOverlays()),
});

export const Map = connect(mapStateToProps, mapDispatchToProps)(MapComponent);
