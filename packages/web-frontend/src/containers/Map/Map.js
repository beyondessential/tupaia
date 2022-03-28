/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createSelector } from 'reselect';
import {
  TileLayer,
  MarkerLayer,
  LeafletMap,
  InteractivePolygon,
  ZoomControl,
} from '@tupaia/ui-components/lib/map';

import { checkBoundsDifference, organisationUnitIsArea } from '../../utils';
import { DemoLand } from './DemoLand';
import { DisasterLayer } from './DisasterLayer';
import {
  selectActiveTileSet,
  selectMeasuresWithDisplayInfo,
  selectCurrentMapOverlayCodes,
  selectCurrentOrgUnit,
  selectHasPolygonMeasure,
  selectMeasureOptions,
  selectOrgUnit,
  selectOrgUnitChildren,
  selectOrgUnitSiblings,
  selectRenderedMeasuresWithDisplayInfo,
  selectAreRegionLabelsPermanent,
  selectMeasureData,
} from '../../selectors';
import { changePosition, closeDropdownOverlays, setOrgUnit, setMobileTab } from '../../actions';
import { TRANS_BLACK, TRANS_BLACK_LESS } from '../../styles';

const CHANGE_TO_PARENT_PERCENTAGE = 0.6;

const StyledMap = styled(LeafletMap)`
  height: 100%;
  width: 100%;
  flex: 1;

  .leaflet-control-zoom {
    z-index: 1;
    border: none;
    top: -50px;
    right: 3px;

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
    // ensure leaflet updates after 0.5 second resize animation has finished
    window.addEventListener('resize', () => setTimeout(() => this.map?.invalidateSize(), 500));
  }

  shouldComponentUpdate(nextProps) {
    const {
      currentOrganisationUnit,
      displayedChildren,
      mapOverlayCodes,
      serieses,
      measureData,
      position,
      tileSetUrl,
    } = this.props;

    if (JSON.stringify(nextProps.mapOverlayCodes) !== JSON.stringify(mapOverlayCodes)) {
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

    if (JSON.stringify(nextProps.position) !== JSON.stringify(position)) return true;

    if (JSON.stringify(nextProps.serieses) !== JSON.stringify(serieses)) return true;

    if (JSON.stringify(nextProps.measureData) !== JSON.stringify(measureData)) return true;

    return false;
  }

  captureMap = map => {
    this.map = map;
  };

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
      onSeeOrgUnitDashboard,
      serieses,
      multiOverlayMeasureData,
      multiOverlaySerieses,
      position,
      shouldSnapToPosition,
      tileSetUrl,
      measureOrgUnits,
      permanentLabels,
      showAttribution,
      showZoomControl,
    } = this.props;

    // Only show data with valid coordinates. Note: this also removes region data
    const processedData = measureData.filter(
      ({ coordinates }) => coordinates && coordinates.length === 2,
    );
    const hasMeasureData = measureData && measureData.length > 0;
    const basicPropsForInteractivePolygon = {
      hasMeasureData,
      measureOrgUnits,
      multiOverlaySerieses,
      multiOverlayMeasureData,
      onChangeOrgUnit,
      permanentLabels,
    };

    return (
      <StyledMap
        onClick={onCloseDropdownOverlays}
        bounds={position.bounds}
        zoom={position.zoom}
        center={position.center}
        shouldSnapToPosition={shouldSnapToPosition}
        onPositionChanged={this.onPositionChanged}
        whenCreated={this.captureMap}
      >
        <TileLayer tileSetUrl={tileSetUrl} showAttribution={showAttribution} />
        {showZoomControl && <ZoomControl position="bottomright" />}
        <DemoLand />
        {currentOrganisationUnit && organisationUnitIsArea(currentOrganisationUnit) && (
          <InteractivePolygon
            area={currentOrganisationUnit}
            organisationUnitChildren={getChildren(currentOrganisationUnit.organisationUnitCode)}
            isActive
            {...basicPropsForInteractivePolygon}
          />
        )}
        {displayedChildren?.map(area => (
          <InteractivePolygon
            area={area}
            key={area.organisationUnitCode}
            organisationUnitChildren={getChildren(area.organisationUnitCode)}
            isChildArea
            {...basicPropsForInteractivePolygon}
          />
        ))}
        {currentOrganisationUnitSiblings?.map(area => (
          <InteractivePolygon
            area={area}
            key={area.organisationUnitCode}
            organisationUnitChildren={getChildren(area.organisationUnitCode)}
            {...basicPropsForInteractivePolygon}
          />
        ))}
        <MarkerLayer
          measureData={processedData}
          serieses={serieses || null}
          onSeeOrgUnitDashboard={onSeeOrgUnitDashboard}
          multiOverlayMeasureData={multiOverlayMeasureData}
          multiOverlaySerieses={multiOverlaySerieses}
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
  measureOrgUnits: PropTypes.array,
  mapOverlayCodes: PropTypes.array.isRequired,
  serieses: PropTypes.array,
  multiOverlayMeasureData: PropTypes.array,
  multiOverlaySerieses: PropTypes.array,
  position: PropTypes.shape({
    center: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    bounds: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    zoom: PropTypes.number,
  }).isRequired,
  onChangeOrgUnit: PropTypes.func.isRequired,
  onSeeOrgUnitDashboard: PropTypes.func.isRequired,
  shouldSnapToPosition: PropTypes.bool.isRequired,
  tileSetUrl: PropTypes.string.isRequired,
  permanentLabels: PropTypes.bool,
  showZoomControl: PropTypes.bool,
  showAttribution: PropTypes.bool,
};

MapComponent.defaultProps = {
  displayedChildren: [],
  measureData: [],
  measureOrgUnits: [],
  serieses: [],
  multiOverlayMeasureData: [],
  multiOverlaySerieses: [],
  currentParent: null,
  permanentLabels: undefined,
  showZoomControl: true,
  showAttribution: true,
};

const selectMeasureDataWithCoordinates = createSelector([measureData => measureData], measureData =>
  measureData.map(({ location, ...otherData }) => ({
    ...otherData,
    coordinates: location && location.point,
    region: location && location.region,
  })),
);

const mapStateToProps = state => {
  const { isAnimating, shouldSnapToPosition, position, displayedMapOverlays } = state.map;
  const mapOverlayCodes = selectCurrentMapOverlayCodes(state);
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentParent = selectOrgUnit(state, currentOrganisationUnit.parent);
  const currentChildren =
    selectOrgUnitChildren(state, currentOrganisationUnit.organisationUnitCode) || [];
  const measureData = selectMeasureDataWithCoordinates(
    selectRenderedMeasuresWithDisplayInfo(state, displayedMapOverlays),
  );
  const serieses = selectMeasureOptions(state, displayedMapOverlays);
  const permanentLabels = selectAreRegionLabelsPermanent(state);
  const multiOverlayMeasureData = selectMeasureData(state, mapOverlayCodes);
  const multiOverlaySerieses = selectMeasureOptions(state, mapOverlayCodes);
  // If the org unit's grandchildren are polygons and have a measure, display grandchildren
  // rather than children
  let displayedChildren = currentChildren;
  let measureOrgUnits = [];

  if (selectHasPolygonMeasure(state)) {
    measureOrgUnits = selectMeasuresWithDisplayInfo(state, displayedMapOverlays);
    const measureOrgUnitCodes = measureOrgUnits.map(orgUnit => orgUnit.organisationUnitCode);
    const grandchildren = currentChildren
      .map(area => selectOrgUnitChildren(state, area.organisationUnitCode))
      .reduce((acc, val) => acc.concat(val), []); // equivelent to .flat(), for IE

    const hasShadedGrandchildren =
      grandchildren &&
      grandchildren.some(child => measureOrgUnitCodes.includes(child.organisationUnitCode));
    if (hasShadedGrandchildren) displayedChildren = grandchildren;
  }

  const getChildren = organisationUnitCode => selectOrgUnitChildren(state, organisationUnitCode);

  return {
    position,
    currentOrganisationUnit,
    currentParent,
    displayedChildren,
    measureData,
    serieses,
    mapOverlayCodes,
    measureOrgUnits,
    multiOverlayMeasureData,
    multiOverlaySerieses,
    currentOrganisationUnitSiblings: selectOrgUnitSiblings(
      state,
      currentOrganisationUnit.organisationUnitCode,
    ),
    getChildren,
    tileSetUrl: selectActiveTileSet(state).url,
    isAnimating,
    shouldSnapToPosition,
    permanentLabels,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
  onSeeOrgUnitDashboard: organisationUnitCode => {
    dispatch(setOrgUnit(organisationUnitCode, true));
    dispatch(setMobileTab('dashboard'));
  },
  onChangePosition: (center, zoom) => dispatch(changePosition(center, zoom)),
  onCloseDropdownOverlays: () => dispatch(closeDropdownOverlays()),
});

export const Map = connect(mapStateToProps, mapDispatchToProps)(MapComponent);
