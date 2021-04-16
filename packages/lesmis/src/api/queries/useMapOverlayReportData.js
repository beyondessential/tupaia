/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import {
  autoAssignColors,
  createValueMapping,
  getSpectrumScaleValues,
  SPECTRUM_MEASURE_TYPES,
  getMeasureDisplayInfo,
} from '@tupaia/ui-components/lib/map';
import { useEntitiesData } from './useEntitiesData';
import { get } from '../api';

export const useMapOverlayReportData = ({ entityCode, mapOverlayCode, hiddenValues = {} }) => {
  const { data: entitiesData, isSuccess } = useEntitiesData();

  const params = {
    shouldShowAllParentCountryResults: false,
    type: 'mapOverlay',
  };

  const { data: measureData, ...query } = useQuery(
    ['mapOverlay', entityCode, mapOverlayCode, params],
    () =>
      get(`report/${entityCode}/${mapOverlayCode}`, {
        params,
      }),
    {
      staleTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: isSuccess && !!entitiesData,
    },
  );

  // processMeasureInfo
  const processedMeasureInfo = measureData ? processMeasureInfo(measureData) : null;

  // processMeasureData
  const processedMeasureData =
    measureData && entitiesData
      ? processMeasureData({
          measureData: measureData.measureData,
          entitiesData,
          measureOptions: processedMeasureInfo.measureOptions,
          mapOverlayCode,
          hiddenValues,
        })
      : null;

  return {
    ...query,
    data: { ...measureData, ...processedMeasureInfo, measureData: processedMeasureData },
  };
};

function processMeasureData({
  measureData,
  entitiesData,
  measureOptions,
  mapOverlayCode,
  hiddenValues,
}) {
  const measureEntities = measureData
    .filter(measure => !hiddenValues.includes(measure[mapOverlayCode]))
    .map(m => m.organisationUnitCode);

  return entitiesData
    .filter(entity => measureEntities.includes(entity.code))
    .map(entity => {
      const measure = measureData.find(e => e.organisationUnitCode === entity.code);
      const displayInfo = getMeasureDisplayInfo(measure, measureOptions);

      return {
        ...entity,
        ...measure,
        coordinates: entity.point,
        region: entity.region,
        color: displayInfo.color,
        icon: displayInfo.icon,
        originalValue: displayInfo.originalValue,
      };
    });
}

function processMeasureInfo({ measureOptions, measureData, ...rest }) {
  const processedOptions = measureOptions.map(measureOption => {
    const { values: mapOptionValues, type, scaleType } = measureOption;

    // assign colors
    const values = autoAssignColors(mapOptionValues);

    // value mapping
    const valueMapping = createValueMapping(values, type);

    if (SPECTRUM_MEASURE_TYPES.includes(type)) {
      // for each spectrum, include the minimum and maximum values for
      // use in the legend scale labels.
      const { min, max } = getSpectrumScaleValues(measureData, measureOption);

      // A grey no data colour looks like part of the neutral scale
      const noDataColour = scaleType === 'neutral' ? 'black' : '#c7c7c7';

      return {
        ...measureOption,
        values,
        valueMapping,
        min,
        max,
        noDataColour,
      };
    }

    return {
      ...measureOption,
      values,
      valueMapping,
    };
  });

  return {
    measureOptions: processedOptions,
    measureData,
    ...rest,
  };
}
