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
import { Moment } from 'moment';

type SingleMapOverlayItem = TupaiaWebMapOverlaysRequest.TranslatedMapOverlay;

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
    startDate?: string | Moment;
    endDate?: string | Moment;
  },
  keepPreviousData?: boolean,
) => {
  // convert moment dates to date strings for the endpoint to use
  const startDate = params?.startDate ? momentToDateString(params.startDate) : undefined;
  const endDate = params?.startDate ? momentToDateString(params.endDate) : undefined;
  const mapOverlayCode = mapOverlay?.code;
  const isLegacy = mapOverlay?.legacy ? 'true' : 'false';

  const enabled = !!projectCode && !!entityCode && !!mapOverlayCode;
  return useQuery(
    ['mapOverlayReport', projectCode, entityCode, mapOverlayCode, startDate, endDate],
    async () => {
      const responseData = await get(`legacyMapOverlayReport/${mapOverlayCode}`, {
        params: {
          organisationUnitCode: entityCode,
          projectCode,
          shouldShowAllParentCountryResults: projectCode !== entityCode,
          startDate,
          endDate,
          legacy: isLegacy,
        },
      });

      return formatMapOverlayData(responseData);
    },
    {
      enabled,
      keepPreviousData,
    },
  );
};
