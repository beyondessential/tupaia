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

// When entity is selected, zoom to entity
const useZoomToEntity = () => {
  const { projectCode, entityCode } = useParams();
  const { data: entity } = useEntity(projectCode, entityCode);
  const map = useMap();

  useEffect(() => {
    if (!entity || !map || (!entity.point && !entity.bounds)) return;
    if (entity.bounds) {
      map.flyToBounds(entity.bounds, {
        animate: false, // don't animate, as it can slow things down a bit
      });
    } else {
      const currentZoom = map.getZoom();
      // if already zoomed in beyond 15, don't zoom out
      const zoomLevel = currentZoom > 15 ? currentZoom : 15;
      map.flyTo(entity.point, zoomLevel, {
        animate: false, // don't animate, as it can slow things down a bit
      });
    }
  }, [entity]);
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
