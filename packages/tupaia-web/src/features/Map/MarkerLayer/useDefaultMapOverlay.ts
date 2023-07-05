/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useSearchParams } from 'react-router-dom';
import { useParams } from 'react-router';
import { useMapOverlays, useProject } from '../../../api/queries';
import {
  DEFAULT_MAP_OVERLAY_ID,
  DEFAULT_PERIOD_PARAM_STRING,
  URL_SEARCH_PARAMS,
} from '../../../constants';
import { useEffect } from 'react';

export const useDefaultMapOverlay = () => {
  const [urlSearchParams, setUrlParams] = useSearchParams();
  const { projectCode, entityCode } = useParams();
  const { data: project } = useProject(projectCode);
  const { mapOverlaysByCode, mapOverlayGroups } = useMapOverlays(projectCode, entityCode);

  const selectedMapOverlay = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const selectedMapOverlayPeriod = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD);
  const isValidMapOverlayId = !!mapOverlaysByCode[selectedMapOverlay];
  const defaultMapOverlayId = project?.defaultMeasure || DEFAULT_MAP_OVERLAY_ID;

  useEffect(() => {
    if (!project) {
      return;
    }

    if (!selectedMapOverlay || !isValidMapOverlayId) {
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, defaultMapOverlayId);
    }

    if (!selectedMapOverlayPeriod) {
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, DEFAULT_PERIOD_PARAM_STRING);
    }

    setUrlParams(urlSearchParams);
  }, [JSON.stringify(mapOverlayGroups)]);
};
