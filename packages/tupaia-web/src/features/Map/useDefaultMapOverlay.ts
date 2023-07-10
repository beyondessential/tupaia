/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProject } from '../../api/queries';
import {
  DEFAULT_MAP_OVERLAY_ID,
  DEFAULT_PERIOD_PARAM_STRING,
  URL_SEARCH_PARAMS,
} from '../../constants';
import { MapOverlayGroup, ProjectCode, EntityCode } from '../../types';

// When the map overlay groups change, update the default map overlay
export const useDefaultMapOverlay = (
  projectCode: ProjectCode,
  mapOverlaysByCode: { [code: EntityCode]: MapOverlayGroup },
) => {
  const [urlSearchParams, setUrlParams] = useSearchParams();
  const { data: project } = useProject(projectCode);

  const selectedMapOverlay = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const selectedMapOverlayPeriod = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD);

  useEffect(() => {
    if (!project) {
      return;
    }

    const isValidMapOverlayId = !!mapOverlaysByCode[selectedMapOverlay!];

    if (!selectedMapOverlay || !isValidMapOverlayId) {
      const defaultMapOverlayId = project.defaultMeasure || DEFAULT_MAP_OVERLAY_ID;
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, defaultMapOverlayId);
    }

    if (!selectedMapOverlayPeriod) {
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, DEFAULT_PERIOD_PARAM_STRING);
    }

    setUrlParams(urlSearchParams);
  }, [JSON.stringify(mapOverlaysByCode)]);
};
