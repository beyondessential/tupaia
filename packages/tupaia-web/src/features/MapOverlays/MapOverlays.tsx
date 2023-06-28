/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PolygonLayer } from './PolygonLayer';
import { EntityResponse } from '../../types';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useMapOverlays as useMapOverlaysData, useLegacyMapOverlay } from '../../api/queries';
import { URL_SEARCH_PARAMS } from '../../constants';
import { useEntitiesWithLocation } from '../../api/queries';
import { MarkerLayer } from './MarkerLayer';

export const MapOverlays = () => {
  const { projectCode, entityCode } = useParams();
  const [urlSearchParams] = useSearchParams();
  const mapOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.OVERLAY);

  const { data: entityData } = useEntitiesWithLocation(projectCode, entityCode);

  const { mapOverlays } = useMapOverlaysData(projectCode, entityCode, mapOverlayCode);

  const { data } = useLegacyMapOverlay(projectCode, entityCode, mapOverlayCode);

  return (
    <>
      <MarkerLayer measureData={data} serieses={mapOverlays} />
      <PolygonLayer entityData={entityData as EntityResponse} />
    </>
  );
};
