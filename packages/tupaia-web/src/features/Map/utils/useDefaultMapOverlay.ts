/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [urlSearchParams] = useSearchParams();
  const { data: project } = useProject(projectCode);

  const selectedMapOverlay = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const selectedMapOverlayPeriod = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD);

  useEffect(() => {
    const isValidMapOverlayId = !!mapOverlaysByCode[selectedMapOverlay!];
    const overlayCodes = mapOverlaysByCode ? Object.keys(mapOverlaysByCode) : [];

    if (!project || overlayCodes.length === 0) {
      return;
    }

    const getDefaultOverlayCode = () => {
      // If the selected overlay is valid, or if there is no selected overlay stop here
      if (!selectedMapOverlay || !isValidMapOverlayId) {
        const { defaultMeasure } = project;

        // if the defaultMeasure exists, use this
        if (mapOverlaysByCode[defaultMeasure]) {
          return defaultMeasure;
        }

        // if the generic default overlay exists, use this
        if (mapOverlaysByCode[DEFAULT_MAP_OVERLAY_ID]) {
          return DEFAULT_MAP_OVERLAY_ID;
        }

        // otherwise use the first overlay in the list
        if (overlayCodes.length > 0) {
          return overlayCodes[0];
        }
      }
    };

    urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, getDefaultOverlayCode());

    if (!selectedMapOverlayPeriod) {
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, DEFAULT_PERIOD_PARAM_STRING);
    }

    // we have to navigate using navigate instead of setUrlParams because setUrlParams seems to override any existing params and existing hash
    navigate({
      ...location,
      search: urlSearchParams.toString(),
    });
  }, [JSON.stringify(mapOverlaysByCode), project, selectedMapOverlay]);
};
