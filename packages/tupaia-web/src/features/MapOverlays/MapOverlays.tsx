/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PolygonLayer } from './PolygonLayer';
import { EntityResponse } from '../../types';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useMapOverlayReport } from '../../api/queries';
import { URL_SEARCH_PARAMS } from '../../constants';
import { useEntitiesWithLocation } from '../../api/queries';
import { MarkerLayer } from './MarkerLayer';

export const MapOverlays = () => {
  const { projectCode, entityCode } = useParams();
  const [urlSearchParams] = useSearchParams();
  const mapOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.OVERLAY);

  const { data: entityData } = useEntitiesWithLocation(projectCode, entityCode);
  const { data: mapOverlayData } = useMapOverlayReport(projectCode, entityCode, mapOverlayCode);

  return (
    <>
      <PolygonLayer entityData={entityData as EntityResponse} />
      <MarkerLayer entityData={entityData as EntityResponse} mapOverlayData={mapOverlayData} />
    </>
  );
};
