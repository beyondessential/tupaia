/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import camelCase from 'camelcase';
import {
  autoAssignColors,
  createValueMapping,
  getSpectrumScaleValues,
  SPECTRUM_MEASURE_TYPES,
  getMeasureDisplayInfo,
} from '@tupaia/ui-components/lib/map';
import { useEntitiesData } from './useEntitiesData';
import { get } from '../api';

const processMeasureInfo = ({ measureSeries, measureData, ...rest }) => {
  const processedSeries = measureSeries.map(series => {
    const { values: mapOptionValues, type, scaleType } = series;

    // assign colors
    const values = autoAssignColors(mapOptionValues);

    // value mapping
    const valueMapping = createValueMapping(values, type);

    if (SPECTRUM_MEASURE_TYPES.includes(type)) {
      // for each spectrum, include the minimum and maximum values for
      // use in the legend scale labels.
      const { min, max } = getSpectrumScaleValues(measureData, series);

      // A grey no data colour looks like part of the neutral scale
      const noDataColour = scaleType === 'neutral' ? 'black' : '#c7c7c7';

      return {
        ...series,
        values,
        valueMapping,
        min,
        max,
        noDataColour,
      };
    }

    return {
      ...series,
      values,
      valueMapping,
    };
  });

  return {
    measureSeries: processedSeries,
    measureData,
    ...rest,
  };
};

const processMeasureData = ({
  entityType,
  measureData,
  entitiesData,
  measureSeries,
  hiddenValues,
  measureLevel,
}) => {
  // Todo: refine which map overlays are supported on which level @see https://github.com/beyondessential/tupaia-backlog/issues/2682
  const displayOnLevel = measureSeries.find(series => series.displayOnLevel);
  if (
    camelCase(entityType) === 'country' &&
    displayOnLevel &&
    camelCase(entityType) !== camelCase(displayOnLevel.displayOnLevel)
  ) {
    return [];
  }

  return entitiesData
    .filter(entity => camelCase(entity.type) === camelCase(measureLevel))
    .map(entity => {
      const measure = measureData.find(e => e.organisationUnitCode === entity.code);
      const { color, icon, originalValue, isHidden } = getMeasureDisplayInfo(
        measure,
        measureSeries,
        hiddenValues,
      );

      return {
        ...entity,
        ...measure,
        isHidden,
        coordinates: entity.point,
        region: entity.region,
        color,
        icon,
        originalValue,
      };
    })
    .filter(({ isHidden }) => !isHidden);
};

export const useMapOverlayReportData = entityCode => {
  const [hiddenValues, setHiddenValues] = useState({});
  const [selectedOverlay, setSelectedOverlay] = useState(null);

  const { data: entitiesData, entitiesByCode, isLoading: entitiesLoading } = useEntitiesData(
    entityCode,
  );

  const entityData = entitiesByCode[entityCode];

  const params = {
    shouldShowAllParentCountryResults: false,
    type: 'mapOverlay',
  };

  const { data: measureData, isLoading: measureDataLoading } = useQuery(
    ['mapOverlay', entityCode, selectedOverlay, params],
    () =>
      get(`report/${entityCode}/${selectedOverlay}`, {
        params,
      }),
    {
      staleTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: !!entityCode && !!selectedOverlay,
    },
  );

  // reset hidden values when changing overlay or entity
  useEffect(() => {
    setHiddenValues({});
  }, [setHiddenValues, selectedOverlay, entityCode]);

  // reset selected overlay when changing entity
  useEffect(() => {
    setSelectedOverlay(null);
  }, [setSelectedOverlay, entityCode]);

  // set default hidden measures when measure data changes
  useEffect(() => {
    const series = measureData ? measureData.measureSeries : [];
    const hiddenByDefault = series.reduce((values, { hideByDefault, key }) => {
      return { ...values, [key]: hideByDefault };
    }, {});

    setHiddenValues(hiddenByDefault);
  }, [setHiddenValues, measureData]);

  const setValueHidden = useCallback(
    (key, value, hidden) => {
      setHiddenValues(currentState => ({
        ...currentState,
        [key]: { ...currentState[key], [value]: hidden },
      }));
    },
    [setHiddenValues],
  );

  // processMeasureInfo
  const processedMeasureInfo = measureData ? processMeasureInfo(measureData) : null;

  // processMeasureData
  const processedMeasureData =
    measureData && entitiesData
      ? processMeasureData({
          entityType: entityData.type,
          measureLevel: measureData.measureLevel,
          measureData: measureData.measureData,
          entitiesData,
          measureSeries: processedMeasureInfo.measureSeries,
          hiddenValues,
        })
      : null;

  return {
    isLoading: entitiesLoading || measureDataLoading,
    data: { ...measureData, ...processedMeasureInfo, measureData: processedMeasureData },
    entityData,
    hiddenValues,
    setValueHidden,
    selectedOverlay,
    setSelectedOverlay,
  };
};
