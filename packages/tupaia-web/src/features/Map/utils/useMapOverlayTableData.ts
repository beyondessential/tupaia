/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { LegendProps, MeasureData, Series } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import {
  useEntitiesWithLocation,
  useEntity,
  useMapOverlayReport,
  useMapOverlays,
} from '../../../api/queries';
import { Entity, EntityCode, ProjectCode } from '../../../types';
import { useDateRanges } from '../../../utils';
import { URL_SEARCH_PARAMS } from '../../../constants';
import { processMeasureData } from './processMeasureData';
import { useRef } from 'react';

type EntityTypeParam = string | null | undefined;

const useProjectCodeHasChanged = projectCode => {
  const [previousProjectCode] = useRef([projectCode]).current;

  const hasProjectCodeChanged = previousProjectCode !== projectCode;

  if (hasProjectCodeChanged) return true;

  return false;
};

const useMapOverlayEntities = (
  projectCode?: ProjectCode,
  rootEntityCode?: EntityCode,
  includeRootEntity?: boolean,
  measureLevel?: EntityTypeParam,
  keepPreviousEntitiesData?: boolean,
) => {
  return useEntitiesWithLocation(
    projectCode,
    rootEntityCode,
    {
      params: {
        includeRootEntity,
        filter: {
          type: measureLevel,
        },
      },
    },
    { enabled: !!measureLevel, keepPreviousData: keepPreviousEntitiesData },
  );
};

interface UseMapOverlayDataProps {
  hiddenValues?: LegendProps['hiddenValues'] | null;
  rootEntityCode?: Entity;
}
export const useMapOverlayTableData = ({
  hiddenValues = {},
  rootEntityCode,
}: UseMapOverlayDataProps = {}) => {
  const { projectCode, entityCode } = useParams();
  const { selectedOverlay, isPolygonSerieses } = useMapOverlays(projectCode, entityCode);
  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD,
    selectedOverlay,
  );
  const { data: entity } = useEntity(projectCode, entityCode);

  // Normally we don't include the root entity in the list of entities for displaying data as the
  // data visuals are for children of the root entity. There is one exception where the root entity is the country
  // and the measure level is country. In this case we want to include the root entity in the list of entities
  const includeRootEntity =
    isPolygonSerieses &&
    selectedOverlay?.measureLevel?.includes('Country') &&
    entity?.type !== 'project';

  // we only want to keep the previous data if the project remains the same
  const projectCodeHasChanged = useProjectCodeHasChanged(projectCode);
  const { data: entities } = useMapOverlayEntities(
    projectCode,
    rootEntityCode,
    includeRootEntity,
    selectedOverlay?.measureLevel,
    !projectCodeHasChanged,
  );

  const { data, isLoading, isFetched, isFetching, isIdle, isPreviousData } = useMapOverlayReport(
    projectCode,
    rootEntityCode,
    selectedOverlay,
    {
      startDate,
      endDate,
    },
    !projectCodeHasChanged,
  );

  const measureData = processMeasureData({
    entitiesData: entities!,
    measureData: data?.measureData,
    serieses: data
      ? [...data?.serieses]?.sort((a: Series, b: Series) => a.key.localeCompare(b.key))
      : [], // previously this was keyed and so ended up being alphabetised, so we need to sort to match the previous way of displaying series data
    hiddenValues: hiddenValues ? hiddenValues : {},
  }) as MeasureData[];

  const loadingData = isLoading || isFetching || (!isFetched && !isIdle);

  return {
    ...data,
    isLoadingInitialData: !isPreviousData && loadingData,
    isLoading: loadingData,
    isFetched,
    serieses: data?.serieses,
    measureData,
    activeEntity: entity,
    startDate,
    endDate,
  };
};
