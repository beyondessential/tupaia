import { Country, SurveyScreenComponentConfig } from '@tupaia/types';

export const useEntityBaseFilters = (
  config?: SurveyScreenComponentConfig | null,
  answers?: Record<string, string>,
  countryCode?: Country['code'],
) => {
  if (!countryCode) return {};

  const filters: Record<string, string | string[]> = { countryCode };
  if (!config) return filters;

  const filter = config?.entity?.filter;
  if (!filter) {
    return filters;
  }

  const { parentId, grandparentId, type, attributes } = filter;

  if (type) {
    filters.type = Array.isArray(type) ? type.join(',') : type;
  }

  if (!answers) return filters;

  if (parentId && parentId.questionId && answers?.[parentId.questionId]) {
    filters.parentId = answers[parentId.questionId];
  }
  if (grandparentId && grandparentId.questionId && answers?.[grandparentId.questionId]) {
    filters.grandparentId = answers[grandparentId.questionId];
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, attrConfig]) => {
      if (answers?.[attrConfig.questionId] === undefined) return;
      const filterValue = answers?.[attrConfig.questionId];
      filters[`attributes->>${key}`] = filterValue;
    });
  }
  return filters;
};
