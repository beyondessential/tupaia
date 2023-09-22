/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMapOverlays, useProject } from '../../../api/queries';
import {
  DEFAULT_MAP_OVERLAY_ID,
  DEFAULT_PERIOD_PARAM_STRING,
  URL_SEARCH_PARAMS,
} from '../../../constants';
import { EntityCode, ProjectCode } from '../../../types';

// When the map overlay groups change, update the default map overlay
export const useDefaultMapOverlay = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [urlSearchParams] = useSearchParams();
  const { data: project } = useProject(projectCode);

  const { mapOverlaysByCode, allMapOverlays } = useMapOverlays(projectCode, entityCode);

  const selectedMapOverlay = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const selectedMapOverlayPeriod = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD);

  const isValidMapOverlayId = !!mapOverlaysByCode[selectedMapOverlay!];
  const overlayCodes = mapOverlaysByCode ? Object.keys(mapOverlaysByCode) : [];

  const getDefaultOverlayCode = () => {
    // If the selected overlay is valid, or if there is no selected overlay stop here
    if ((!selectedMapOverlay || !isValidMapOverlayId) && project) {
      const { defaultMeasure } = project;

      // if the defaultMeasure exists, use this
      if (mapOverlaysByCode[defaultMeasure as string]) {
        return defaultMeasure;
      }

      // if the generic default overlay exists, use this
      if (mapOverlaysByCode[DEFAULT_MAP_OVERLAY_ID]) {
        return DEFAULT_MAP_OVERLAY_ID;
      }

      // otherwise use the first overlay in the list
      if (allMapOverlays.length > 0) {
        return allMapOverlays[0].code;
      }
    }
  };

  useEffect(() => {
    // stop extra change of default map overlay if the new project hasn't yet loaded
    if (project?.code !== projectCode) return;
    if (!project || overlayCodes.length === 0) {
      // Clear map overlay data when there are no overlays to select from
      queryClient.invalidateQueries(['mapOverlayReport', projectCode]);
      return;
    }

    const defaultOverlayCode = getDefaultOverlayCode();
    if (defaultOverlayCode) {
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, defaultOverlayCode as string);
    }
    if (!selectedMapOverlayPeriod && selectedMapOverlay) {
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, DEFAULT_PERIOD_PARAM_STRING);
    }

    // we have to navigate using navigate instead of setUrlParams because setUrlParams seems to override any existing params and existing hash
    navigate({
      ...location,
      search: urlSearchParams.toString(),
    });
  }, [JSON.stringify(mapOverlaysByCode), project, selectedMapOverlay]);
};
