/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TileLayer, MarkerLayer } from '@tupaia/ui-components/lib/map';
import { LeafletMap } from './NewLeafletMap';
import { checkBoundsDifference, organisationUnitIsArea } from '../../utils';
import ConnectedPolygon from './PolygonLayer/ConnectedPolygon';
import { DemoLand } from './DemoLand';

const CHANGE_TO_PARENT_PERCENTAGE = 0.6;

export const NewMap = ({
  tileSetUrl,
  closeDropdownOverlays,
  sidePanelWidth,
  displayedChildren,
  position,
  shouldSnapToPosition,
  measureData,
  measureInfo,
  changePosition,
  setOrgUnit,
  currentParent,
  currentOrganisationUnitSiblings,
  currentOrganisationUnit,
}) => {
  const { serieses, measureOptions } = measureInfo;

  console.log('measureData', measureData);

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

  const renderPolygons = () => {
    const areaPolygons = (displayedChildren || []).map(area => (
      <ConnectedPolygon area={area} key={area.organisationUnitCode} isChildArea />
    ));

    const siblingPolygons = (currentOrganisationUnitSiblings || []).map(area => (
      <ConnectedPolygon area={area} key={area.organisationUnitCode} />
    ));

    return [...areaPolygons, ...siblingPolygons];
  };

  const renderActivePolygons = () => {
    // Render the currentOrgUnit polygon perimeter if it is an area (i.e. not a facility)
    if (currentOrganisationUnit && organisationUnitIsArea(currentOrganisationUnit)) {
      return (
        <ConnectedPolygon
          area={currentOrganisationUnit}
          isActive
          // Randomize key to ensure polygon appears at top. This is still imporatant even
          // though the polygon is in a LayerGroup due to issues with react-leaflet that
          // maintainer says are out of scope for the module.
          key={`currentOrgUnitPolygon${Math.random()}`}
        />
      );
    }
    return null;
  };

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
      {renderPolygons()}
      {renderActivePolygons()}
      <MarkerLayer measureData={processedData || null} serieses={measureOptions || null} />
    </LeafletMap>
  );
};
