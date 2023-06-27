/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PolygonLayer } from './PolygonLayer';
import { URL_SEARCH_PARAMS } from '../../constants';
import { useEntities, useLegacyMapOverlay } from '../../api/queries';

export const MapOverlays = () => {
  const { projectCode, entityCode } = useParams();
  const { data: entityData } = useEntities(projectCode, entityCode, {
    params: { fields: ['parent_code', 'code', 'name', 'type', 'bounds', 'region'] },
  });
  const [urlSearchParams] = useSearchParams();
  const overlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.OVERLAY);
  const { data: mapOverlayData } = useLegacyMapOverlay(overlayCode, {
    params: {
      organisationUnitCode: entityCode,
      projectCode,
      shouldShowAllParentCountryResults: true,
    },
  });
  console.log('mapOverlayData', mapOverlayData);
  return <PolygonLayer entityData={entityData} mapOverlayData={mapOverlayData} />;
};
