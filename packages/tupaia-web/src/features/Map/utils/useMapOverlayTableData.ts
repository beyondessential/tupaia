/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { LegendProps, MeasureData, Series } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import { useEntitiesWithLocation, useEntity, useMapOverlayReport } from '../../../api/queries';
import { processMeasureData } from './processMeasureData';
import { useMapOverlays } from '../../../api/queries';
import { Entity, EntityCode, ProjectCode } from '../../../types';
import { useDateRanges } from '../../../utils';
import { URL_SEARCH_PARAMS } from '../../../constants';

type EntityTypeParam = string | null | undefined;

const useMapOverlayEntities = (
  projectCode?: ProjectCode,
  rootEntityCode?: EntityCode,
  includeRootEntity?: boolean,
  measureLevel?: EntityTypeParam,
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
    { enabled: !!measureLevel },
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

  const { data: entities } = useMapOverlayEntities(
    projectCode,
    rootEntityCode,
    includeRootEntity,
    selectedOverlay?.measureLevel,
  );

  const { data, isLoading, isFetched, isFetching } = useMapOverlayReport(
    projectCode,
    rootEntityCode,
    selectedOverlay,
    {
      startDate,
      endDate,
    },
  );

  const measureData = processMeasureData({
    entitiesData: entities!,
    measureData: data?.measureData,
    serieses: data
      ? [...data?.serieses]?.sort((a: Series, b: Series) => a.key.localeCompare(b.key))
      : [], // previously this was keyed and so ended up being alphabetised, so we need to sort to match the previous way of displaying series data
    hiddenValues: hiddenValues ? hiddenValues : {},
  }) as MeasureData[];

  return {
    ...data,
    isLoading: isLoading || isFetching || !isFetched,
    isFetched,
    serieses: data?.serieses,
    measureData,
    activeEntity: entity,
    startDate,
    endDate,
  };
};
