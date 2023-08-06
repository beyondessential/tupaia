/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { MeasureData, Series } from '@tupaia/ui-map-components';
import { LegendProps } from '@tupaia/ui-map-components';
import { useEntitiesWithLocation } from '../../../api/queries';
import { processMeasureData } from '../MapOverlays/processMeasureData';
import { useMapOverlays } from '../../../api/queries';
import { useMapOverlayReport } from '../../../api/queries';
import { EntityCode, ProjectCode } from '../../../types';

export const useMapOverlayData = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  hiddenValues?: LegendProps['hiddenValues'],
): { serieses: Series[] | undefined; processedMeasureData: MeasureData[] | undefined } => {
  const useEntitiesByMeasureLevel = (measureLevel?: string) => {
    const getSnakeCase = (measureLevel?: string) => {
      return measureLevel
        ?.split(/\.?(?=[A-Z])/)
        .join('_')
        .toLowerCase();
    };

    return useEntitiesWithLocation(
      projectCode,
      entityCode,
      {
        params: {
          includeRoot: false,
          filter: {
            type: getSnakeCase(measureLevel),
          },
        },
      },
      { enabled: !!measureLevel },
    );
  };

  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: entitiesData } = useEntitiesByMeasureLevel(selectedOverlay?.measureLevel);
  const { data: mapOverlayData } = useMapOverlayReport(projectCode, entityCode, selectedOverlay);

  if (!entitiesData || !mapOverlayData) {
    return {
      serieses: undefined,
      processedMeasureData: undefined,
    };
  }

  const processedMeasureData = processMeasureData({
    entitiesData,
    measureData: mapOverlayData.measureData,
    serieses: mapOverlayData.serieses,
    hiddenValues: hiddenValues ? hiddenValues : {},
  }) as MeasureData[];

  if (!processedMeasureData || !mapOverlayData.serieses) {
    return {
      serieses: undefined,
      processedMeasureData: undefined,
    };
  }

  const { serieses } = mapOverlayData;

  if (!processedMeasureData || !mapOverlayData) {
    return {
      serieses: undefined,
      processedMeasureData: undefined,
    };
  }
  return { serieses, processedMeasureData };
};
