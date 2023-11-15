/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useMap } from 'react-leaflet';
import { LegendProps } from '@tupaia/ui-map-components';
import { useMapOverlayMapData } from '../utils';
import { PolygonLayer } from './PolygonLayer';
import { MarkerLayer } from './MarkerLayer';
import { useEntity } from '../../../api/queries';

const POINT_ZOOM_LEVEL = 15;
// When entity is selected, zoom to entity
const useZoomToEntity = () => {
  const { projectCode, entityCode } = useParams();
  const { data: entity } = useEntity(projectCode, entityCode);
  const map = useMap();

  // This is a replacement for the map positioning being handled in the ui-map-components LeafletMap file. We are doing this because we need access to the user's current zoom level, and are also slowly moving away from class based components to use hooks instead.
  useEffect(() => {
    if (!entity || !map || (!entity.point && !entity.bounds)) return;
    if (entity.bounds) {
      map.flyToBounds(entity.bounds, {
        animate: false, // don't animate, as it can slow things down a bit
      });
    } else {
      const currentZoom = map.getZoom();
      // if already zoomed in beyond the POINT_ZOOM_LEVEL, don't zoom out
      const zoomLevel = currentZoom > POINT_ZOOM_LEVEL ? currentZoom : POINT_ZOOM_LEVEL;
      map.flyTo(entity.point, zoomLevel, {
        animate: false, // don't animate, as it can slow things down a bit
      });
    }
  }, [JSON.stringify(entity?.point), JSON.stringify(entity?.bounds)]);
};

export const MapOverlaysLayer = ({
  hiddenValues,
}: {
  hiddenValues: LegendProps['hiddenValues'];
}) => {
  const { serieses, measureData, isLoading } = useMapOverlayMapData(hiddenValues);
  useZoomToEntity();
  return (
    <>
      <PolygonLayer measureData={measureData} serieses={serieses} />
      {isLoading ? null : <MarkerLayer measureData={measureData} serieses={serieses} />}
    </>
  );
};
