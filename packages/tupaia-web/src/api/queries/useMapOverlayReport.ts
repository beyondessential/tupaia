/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { momentToDateString } from '@tupaia/utils';
import { TupaiaWebMapOverlaysRequest } from '@tupaia/types';
import {
  autoAssignColors,
  createValueMapping,
  getSpectrumScaleValues,
  SPECTRUM_MEASURE_TYPES,
} from '@tupaia/ui-map-components';
import { get } from '../api';
import { EntityCode, ProjectCode } from '../../types';

type SingleMapOverlayItem = TupaiaWebMapOverlaysRequest.TranslatedMapOverlay;

// make the response from the new endpoint look like the response from the legacy endpoint
const normaliseResponse = (measureDataResponse: any, overlay: SingleMapOverlayItem) => {
  const { code, measureLevel, displayType, ...restOfOverlay } = overlay;

  const serieses = [
    {
      measureLevel,
      type: displayType,
      key: 'value',
      ...restOfOverlay,
    },
  ];

  return {
    measureCode: code,
    measureLevel,
    serieses,
    measureData: measureDataResponse,
  };
};

const formatMapOverlayData = (data: any) => {
  const { serieses, measureData } = data;

  const processedSerieses = serieses.map((series: any) => {
    const { values: mapOptionValues, type } = series;
    const values = autoAssignColors(mapOptionValues);
    const valueMapping = createValueMapping(values, type);

    if (SPECTRUM_MEASURE_TYPES.includes(type)) {
      // for each spectrum, include the minimum and maximum values for
      // use in the legend scale labels.
      const { min, max } = getSpectrumScaleValues(measureData, series);
      const noDataColour = '#c7c7c7';

      return {
        ...series,
        values,
        valueMapping,
        min,
        max,
        noDataColour,
      };
    }

    // If it is not a radius series and there is no icon set a default
    if (series.type !== 'radius' && !series.icon) {
      return {
        ...series,
        values,
        valueMapping,
      };
    }

    return {
      ...series,
      values,
      valueMapping,
    };
  });

  return {
    ...data,
    serieses: processedSerieses,
  };
};

export const useMapOverlayReport = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  mapOverlay?: SingleMapOverlayItem,
  params?: {
    startDate?: string;
    endDate?: string;
  },
) => {
  // convert moment dates to date strings for the endpoint to use
  const startDate = params?.startDate ? momentToDateString(params.startDate) : undefined;
  const endDate = params?.startDate ? momentToDateString(params.endDate) : undefined;
  const mapOverlayCode = mapOverlay?.code;
  const isLegacy = mapOverlay?.legacy;
  const endpoint = isLegacy ? 'legacyMapOverlayReport' : 'report';

  const enabled = !!projectCode && !!entityCode && !!mapOverlayCode;
  return useQuery(
    ['mapOverlayReport', projectCode, entityCode, mapOverlayCode, startDate, endDate],
    async () => {
      const response = await get(`${endpoint}/${mapOverlayCode}`, {
        params: {
          organisationUnitCode: entityCode,
          projectCode,
          shouldShowAllParentCountryResults: projectCode !== entityCode,
          startDate,
          endDate,
        },
      });

      // We know mapOverlay is defined by this point because of the enabled check, but lint doesn't detect it
      const responseData = isLegacy ? response : normaliseResponse(response.data, mapOverlay as SingleMapOverlayItem);
      return formatMapOverlayData(responseData);
    },
    {
      enabled,
      keepPreviousData: enabled, // Only keep previous data if this is still enabled. This fixes an issue where going back to an entity with no map overlays would show the previous entity's map overlay data
    },
  );
};
