import { useEffect, useRef } from 'react';
import { LegendProps, Series } from '@tupaia/ui-map-components';
import { useParams } from 'react-router';
import { TupaiaWebMapOverlaysRequest } from '@tupaia/types';
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

type EntityTypeParam = string | null | undefined;

const usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
};

const useKeepPreviousData = (projectCode, measureLevel) => {
  const previousProjectCode = usePrevious(projectCode);
  const previousMeasureLevel = usePrevious(measureLevel);
  // we only want to keep the previous data if the project remains the same
  // and the measure level remains the same
  return previousProjectCode === projectCode && previousMeasureLevel === measureLevel;
};

const useMapOverlayEntities = (
  projectCode?: ProjectCode,
  rootEntityCode?: EntityCode,
  includeRootEntity?: boolean,
  measureLevel?: EntityTypeParam,
  keepPreviousEntitiesData?: boolean,
  entityAttributesFilter: TupaiaWebMapOverlaysRequest.TranslatedMapOverlay['entityAttributesFilter'] = {},
) => {
  return useEntitiesWithLocation(
    projectCode,
    rootEntityCode,
    {
      params: {
        includeRootEntity,
        filter: {
          type: measureLevel,
          ...Object.entries(entityAttributesFilter).reduce((result, [attribute, filterValue]) => {
            return {
              ...result,
              // convert the filter value to a string if it is an array, so that it gets passed to the server as a comma separated string
              [`attributes->>${attribute}`]: Array.isArray(filterValue)
                ? filterValue.join(',')
                : filterValue,
            };
          }, {}),
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
  const keepPreviousData = useKeepPreviousData(projectCode, selectedOverlay?.measureLevel);
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

  const {
    data: entities,
    error: mapOverlayEntitiesError,
    refetch: refetchMapOverlayEntities,
  } = useMapOverlayEntities(
    projectCode,
    rootEntityCode,
    includeRootEntity,
    selectedOverlay?.measureLevel,
    keepPreviousData,
    selectedOverlay?.entityAttributesFilter,
  );

  const {
    data,
    isLoading,
    isFetched,
    isFetching,
    fetchStatus,
    isPreviousData,
    error: mapOverlayReportError,
    refetch: refetchMapOverlayReport,
  } = useMapOverlayReport(
    projectCode,
    rootEntityCode,
    selectedOverlay,
    {
      startDate,
      endDate,
    },
    keepPreviousData,
  );

  const measureData = processMeasureData({
    entitiesData: entities!,
    measureData: data?.measureData,
    serieses: data
      ? [...data?.serieses]?.sort((a: Series, b: Series) => a.key.localeCompare(b.key))
      : [], // previously this was keyed and so ended up being alphabetised, so we need to sort to match the previous way of displaying series data
    hiddenValues: hiddenValues ? hiddenValues : {},
  });

  const loadingData = isLoading || isFetching || (!isFetched && fetchStatus !== 'idle');

  const isLoadingDifferentMeasureLevel =
    (!isPreviousData || data?.measureLevel !== selectedOverlay?.measureLevel) && loadingData;

  return {
    ...data,
    isLoadingDifferentMeasureLevel,
    isLoading: loadingData,
    isFetched,
    serieses: data?.serieses,
    measureData,
    activeEntity: entity,
    startDate,
    endDate,
    error: mapOverlayEntitiesError || mapOverlayReportError,
    refetch: mapOverlayEntitiesError ? refetchMapOverlayEntities : refetchMapOverlayReport,
  };
};
