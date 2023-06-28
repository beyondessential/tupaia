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
// import { flattenMapOverlays } from '../../utils';
import { useEntitiesWithLocation } from '../../api/queries';

const useMapOverlays = () => {
  const { projectCode, entityCode } = useParams();
  const [urlSearchParams] = useSearchParams();
  const mapOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.OVERLAY);

  const { data: mapOverlaysData, isLoading } = useMapOverlaysData(projectCode, entityCode);

  const { data: mapOverlayReportData, isLoading: isLoadingReport } = useLegacyMapOverlay(
    projectCode,
    entityCode,
    mapOverlayCode,
  );

  console.log('mapOverlaysData', mapOverlaysData);
  console.log('mapOverlayReportData', mapOverlayReportData);

  return {
    mapOverlaysData,
    mapOverlayReportData,
    isLoading: isLoading || isLoadingReport,
    // selectedOverlay: flattenedOverlays.find(mapOverlay => mapOverlay.code === mapOverlayCode),
  };
};

export const MapOverlays = () => {
  const { projectCode, entityCode } = useParams();
  const { data: entityData } = useEntitiesWithLocation(projectCode, entityCode);
  const query = useMapOverlays();

  return <PolygonLayer entityData={entityData as EntityResponse} />;
};

// const mapOverlayPeriod =
//   urlSearchParams.get(URL_SEARCH_PARAMS.OVERLAY_PERIOD) || 'DEFAULT_PERIOD';
// const flattenedOverlays = flattenMapOverlays(mapOverlaysResponse?.mapOverlays);

// useEffect(() => {
//   const updateMapOverlaySearchParams = () => {
//     if (isLoading || !flattenedOverlays || !mapOverlayCode) return;
//
//     const selectedOverlay = flattenedOverlays.find(
//       mapOverlay => mapOverlay.code === mapOverlayCode,
//     );
//     if (selectedOverlay) return;
//     // whenever the project or entity changes, and the available map overlays changes, update the map overlay search params to either the first available overlay, or the previously selected overlay if it still applies
//     urlSearchParams.set(URL_SEARCH_PARAMS.OVERLAY, flattenedOverlays[0]?.code || '');
//     urlSearchParams.set(URL_SEARCH_PARAMS.OVERLAY_PERIOD, mapOverlayPeriod);
//     setUrlSearchParams(urlSearchParams.toString(), {
//       replace: true,
//     });
//   };
//   updateMapOverlaySearchParams();
// }, [projectCode, entityCode, flattenedOverlays, mapOverlayCode, isLoading]);
