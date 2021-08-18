/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TileLayer, MarkerLayer } from '@tupaia/ui-components/lib/map';
import { LeafletMap } from './LeafletMap';
import { checkBoundsDifference } from '../../utils';

const CHANGE_TO_PARENT_PERCENTAGE = 0.6;

export const NewMap = ({
  tileSetUrl,
  closeDropdownOverlays,
  sidePanelWidth,
  position,
  shouldSnapToPosition,
  measureData,
  measureInfo,
  changePosition,
  setOrgUnit,
  currentParent,
}) => {
  const { serieses, measureOptions } = measureInfo;

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

  return (
    <LeafletMap
      onClick={closeDropdownOverlays}
      position={position}
      shouldSnapToPosition={shouldSnapToPosition}
      rightPadding={sidePanelWidth}
      onPositionChanged={onPositionChanged}
    >
      <TileLayer tileSetUrl={tileSetUrl} />
      <MarkerLayer measureData={measureData || null} serieses={measureOptions || null} />
    </LeafletMap>
  );
};
