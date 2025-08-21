import { SurveyScreenComponentConfig, EntityFilter } from '@tupaia/types';
import { useEntityBaseFilters } from './useEntityBaseFilters';
import { convertBaseFiltersToDbCriteria } from './convertEntityFiltersToDbCriteria';

/**
 * Hook that combines useEntityBaseFilters with conversion to database criteria format.
 * Returns EntityFilter that can be directly used with EntityModel queries.
 * 
 * @param config - Survey screen component configuration
 * @param answers - Form answers to extract filter values from
 * @param countryCode - Country code to filter by
 * @returns EntityFilter object ready for database queries
 * 
 * @example
 * const dbCriteria = useEntityDbCriteria(config, answers, 'TO');
 * const entities = await models.entity.find(dbCriteria);
 */
export const useEntityDbCriteria = (
  config?: SurveyScreenComponentConfig | null,
  answers?: Record<string, string>,
  countryCode?: string,
): EntityFilter => {
  const baseFilters = useEntityBaseFilters(config, answers, countryCode);
  return convertBaseFiltersToDbCriteria(baseFilters);
};

