/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProject } from '../../../api/queries';
import {
  DEFAULT_MAP_OVERLAY_ID,
  DEFAULT_PERIOD_PARAM_STRING,
  URL_SEARCH_PARAMS,
} from '../../../constants';
import { MapOverlayGroup, ProjectCode, EntityCode } from '../../../types';

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
      const { defaultMeasure } = project;
      const overlayCodes = mapOverlaysByCode ? Object.keys(mapOverlaysByCode) : [];
      // If there are no map overlays, the default overlay is the DEFAULT_MAP_OVERLAY_ID
      // however if there are map overlays, use the first available overlay
      let defaultMapOverlayId = overlayCodes.length > 0 ? overlayCodes[0] : DEFAULT_MAP_OVERLAY_ID;
      // if there is a default measure and it is in the list of overlays, use it
      if (defaultMeasure && !!mapOverlaysByCode[defaultMeasure]) {
        defaultMapOverlayId = defaultMeasure;
      }

      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, defaultMapOverlayId);
    }

    if (!selectedMapOverlayPeriod) {
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, DEFAULT_PERIOD_PARAM_STRING);
    }

    setUrlParams(urlSearchParams);
  }, [JSON.stringify(mapOverlaysByCode), project, selectedMapOverlay]);
};
