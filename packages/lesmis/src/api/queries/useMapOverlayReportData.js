import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import camelCase from 'camelcase';
import {
  autoAssignColors,
  createValueMapping,
  getSpectrumScaleValues,
  SPECTRUM_MEASURE_TYPES,
  getMeasureDisplayInfo,
  calculateRadiusScaleFactor,
} from '@tupaia/ui-map-components';
import { useEntitiesData } from './useEntitiesData';
import { yearToApiDates } from './utils';
import { useUrlSearchParam } from '../../utils/useUrlSearchParams';
import { useMapOverlaysData, findOverlay } from './useMapOverlaysData';
import { get } from '../api';

const getMeasureDataFromResponse = (overlay, measureDataResponse) => {
  // Legacy overlays have the config returned in the data response, return directly
  if (!overlay || overlay.legacy === true) {
    return measureDataResponse;
  }

  const { measureCode, measureLevel, displayType, dataElementCode, ...restOfOverlay } = overlay;

  const measureOptions = [
    {
      measureLevel,
      type: displayType,
      key: dataElementCode || 'value',
      ...restOfOverlay,
    },
  ];

  return {
    measureCode,
    measureLevel,
    measureOptions,
    serieses: measureOptions,
    measureData: measureDataResponse,
  };
};

const processSerieses = (serieses, measureData) =>
  serieses.map(series => {
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
        icon: 'pin',
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

const processMeasureData = ({
  entityType,
  measureData,
  entitiesData,
  serieses,
  hiddenValues,
  measureLevel,
}) => {
  // Todo: refine which map overlays are supported on which level @see https://github.com/beyondessential/tupaia-backlog/issues/2682
  const displayOnLevel = serieses.find(series => series.displayOnLevel);
  if (
    camelCase(entityType) === 'country' &&
    displayOnLevel &&
    camelCase(entityType) !== camelCase(displayOnLevel.displayOnLevel)
  ) {
    return [];
  }

  const radiusScaleFactor = calculateRadiusScaleFactor(measureData);

  return entitiesData
    .filter(entity => camelCase(entity.type) === camelCase(measureLevel))
    .map(entity => {
      const measure = measureData.find(e => e.organisationUnitCode === entity.code);
      const { color, icon, originalValue, isHidden, radius } = getMeasureDisplayInfo(
        measure,
        serieses,
        hiddenValues,
        radiusScaleFactor,
      );

      return {
        ...entity,
        ...measure,
        isHidden,
        radius,
        organisationUnit: entity.code,
        coordinates: entity.point,
        region: entity.region,
        color,
        icon,
        originalValue,
      };
    });
};

export const useMapOverlayReportData = ({ entityCode, year }) => {
  const [hiddenValues, setHiddenValues] = useState({});
  const [selectedOverlay, setSelectedOverlay] = useUrlSearchParam('overlay', null);

  const {
    data: entitiesData,
    entitiesByCode,
    isLoading: entitiesLoading,
  } = useEntitiesData(entityCode);
  const { data: overlaysData, isLoading: overlaysLoading } = useMapOverlaysData({ entityCode });

  const entityData = entitiesByCode[entityCode];
  const overlay = findOverlay(overlaysData, selectedOverlay);
  const reportCode = overlay?.legacy ? selectedOverlay : overlay?.reportCode;
  const { startDate, endDate } = yearToApiDates(year);

  const params = {
    startDate,
    endDate,
    shouldShowAllParentCountryResults: false,
    type: 'mapOverlay',
    legacy: overlay?.legacy,
  };

  const { data: measureDataResponse, isLoading: measureDataLoading } = useQuery(
    ['mapOverlay', entityCode, selectedOverlay, params],
    () =>
      get(`report/${entityCode}/${reportCode}`, {
        params,
      }),
    {
      staleTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: !!reportCode && !!overlay,
    },
  );

  const measureData = measureDataResponse
    ? getMeasureDataFromResponse(overlay, measureDataResponse?.data)
    : null;

  // reset hidden values when changing overlay or entity
  useEffect(() => {
    setHiddenValues({});
  }, [setHiddenValues, selectedOverlay, entityCode]);

  // set default hidden measures when measure data changes
  useEffect(() => {
    const series = measureData ? measureData.serieses : [];
    const hiddenByDefault = series.reduce((values, { hideByDefault, key }) => {
      return { ...values, [key]: hideByDefault };
    }, {});

    setHiddenValues(hiddenByDefault);
  }, [setHiddenValues, measureDataResponse]);

  const setValueHidden = useCallback(
    (key, value, hidden) => {
      setHiddenValues(currentState => ({
        ...currentState,
        [key]: { ...currentState[key], [value]: hidden },
      }));
    },
    [setHiddenValues],
  );

  // processSerieses
  const processedSerieses = measureData
    ? processSerieses(measureData.serieses, measureData.measureData)
    : null;

  // processMeasureData
  const processedMeasureData =
    measureData && entitiesData
      ? processMeasureData({
          entityType: entityData.type,
          measureLevel: measureData.measureLevel,
          measureData: measureData.measureData,
          entitiesData,
          serieses: processedSerieses,
          hiddenValues,
        })
      : null;

  return {
    isLoading: entitiesLoading || measureDataLoading || overlaysLoading,
    data: { ...measureData, serieses: processedSerieses, measureData: processedMeasureData },
    entityData,
    hiddenValues,
    setValueHidden,
    selectedOverlay,
    selectedOverlayName: overlay?.name,
    setSelectedOverlay,
  };
};
