/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { TileLayer, MarkerLayer } from '@tupaia/ui-components/lib/map';
import { LeafletMap } from './LeafletMap';
import { checkBoundsDifference, organisationUnitIsArea } from '../../utils';
import { PolygonWrapper as PolygonComponent } from './UIComponents/PolygonWrapper';
import { DemoLand } from './DemoLand';
import { DisasterLayer } from './DisasterLayer';

const CHANGE_TO_PARENT_PERCENTAGE = 0.6;

export const Map = React.memo(
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
          <PolygonComponent
            area={area}
            key={area.organisationUnitCode}
            organisationUnitChildren={getChildren(area.organisationUnitCode)}
            isChildArea
          />
        ))}
        {(currentOrganisationUnitSiblings || []).map(area => (
          <PolygonComponent
            area={area}
            key={area.organisationUnitCode}
            organisationUnitChildren={getChildren(area.organisationUnitCode)}
          />
        ))}
        {currentOrganisationUnit && organisationUnitIsArea(currentOrganisationUnit) && (
          <PolygonComponent
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

Map.propTypes = {
  currentOrganisationUnit: PropTypes.object.isRequired,
  closeDropdownOverlays: PropTypes.func.isRequired,
  changePosition: PropTypes.func.isRequired,
  displayedChildren: PropTypes.arrayOf(PropTypes.object),
  getChildren: PropTypes.func.isRequired,
  measureId: PropTypes.string.isRequired,
  measureInfo: PropTypes.object.isRequired,
  onChangeOrgUnit: PropTypes.func.isRequired,
  permanentLabels: PropTypes.bool,
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

Map.defaultProps = {
  displayedChildren: [],
  permanentLabels: true,
};
