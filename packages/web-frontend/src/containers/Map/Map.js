/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { TileLayer, MarkerLayer } from '@tupaia/ui-components/lib/map';
import { LeafletMap } from './LeafletMap';
import { checkBoundsDifference, organisationUnitIsArea } from '../../utils';
import { DemoLand } from './DemoLand';
import { ConnectedPolygon } from './ConnectedPolygon';
import { DisasterLayer } from './DisasterLayer';
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
import {
  changePosition,
  closeDropdownOverlays,
  setMapIsAnimating,
  setOrgUnit,
} from '../../actions';

const CHANGE_TO_PARENT_PERCENTAGE = 0.6;

/**
 * Map
 *
 * Includes basic map setup/rendering,
 * controlled through props that are connected to the redux store. Rendering includes heatmaps
 * markers, polygons.
 */
const MapComponent = React.memo(
  ({
    changePosition,
    closeDropdownOverlays,
    currentParent,
    currentOrganisationUnitSiblings,
    currentOrganisationUnit,
    displayedChildren,
    getChildren,
    measureData,
    measureInfo,
    position,
    setOrgUnit,
    shouldSnapToPosition,
    sidePanelWidth,
    tileSetUrl,
  }) => {
    const { measureOptions } = measureInfo;

    const checkZoomOutToParentOrgUnit = bounds => {
      // Maybe we need to zoom out to a parent!
      // First, check if there's a valid parent to zoom out to
      if (currentParent) {
        if (currentParent.location && currentParent.location.bounds) {
          // Now check if we're at a reasonable zoom level to switch to that parent
          const difference = checkBoundsDifference(currentParent.location.bounds, bounds);
          if (difference > CHANGE_TO_PARENT_PERCENTAGE) {
            setOrgUnit(currentParent.organisationUnitCode, false);
          }
        }
      }
    };

    const onPositionChanged = (center, bounds, zoom) => {
      // only check when zooming _out_
      if (zoom < position.zoom) {
        checkZoomOutToParentOrgUnit(bounds);
      }

      // Notify redux that we've moved
      changePosition(center, zoom);
    };

    // Could this move to the MarkerLayer?
    const processedData = measureData
      .filter(data => data.coordinates && data.coordinates.length === 2)
      .filter(data => !data.isHidden);

    return (
      <LeafletMap
        onClick={closeDropdownOverlays}
        position={position}
        shouldSnapToPosition={shouldSnapToPosition}
        rightPadding={sidePanelWidth}
        onPositionChanged={onPositionChanged}
      >
        <TileLayer tileSetUrl={tileSetUrl} />
        <DemoLand />
        {(displayedChildren || []).map(area => (
          <ConnectedPolygon
            area={area}
            key={area.organisationUnitCode}
            organisationUnitChildren={getChildren(area.organisationUnitCode)}
            isChildArea
          />
        ))}
        {(currentOrganisationUnitSiblings || []).map(area => (
          <ConnectedPolygon
            area={area}
            key={area.organisationUnitCode}
            organisationUnitChildren={getChildren(area.organisationUnitCode)}
          />
        ))}
        {currentOrganisationUnit && organisationUnitIsArea(currentOrganisationUnit) && (
          <ConnectedPolygon
            area={currentOrganisationUnit}
            organisationUnitChildren={getChildren(currentOrganisationUnit.organisationUnitCode)}
            isActive
          />
        )}
        <MarkerLayer measureData={processedData || null} serieses={measureOptions || null} />
        <DisasterLayer />
      </LeafletMap>
    );
  },
);

MapComponent.propTypes = {
  currentOrganisationUnit: PropTypes.object.isRequired,
  closeDropdownOverlays: PropTypes.func.isRequired,
  changePosition: PropTypes.func.isRequired,
  displayedChildren: PropTypes.arrayOf(PropTypes.object),
  getChildren: PropTypes.func.isRequired,
  measureInfo: PropTypes.object.isRequired,
  position: PropTypes.shape({
    center: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    bounds: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    zoom: PropTypes.number,
  }).isRequired,
  setOrgUnit: PropTypes.func.isRequired,
  shouldSnapToPosition: PropTypes.bool.isRequired,
  sidePanelWidth: PropTypes.number.isRequired,
  tileSetUrl: PropTypes.string.isRequired,
};

MapComponent.defaultProps = {
  displayedChildren: [],
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
  setOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
  changePosition: (center, zoom) => dispatch(changePosition(center, zoom)),
  closeDropdownOverlays: () => dispatch(closeDropdownOverlays()),
  setMapIsAnimating: isAnimating => dispatch(setMapIsAnimating(isAnimating)),
});

export const Map = connect(mapStateToProps, mapDispatchToProps)(MapComponent);
