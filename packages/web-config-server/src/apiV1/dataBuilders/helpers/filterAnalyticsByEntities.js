import { Entity } from '/models';
import keyBy from 'lodash.keyby';

const FILTERS = {
  filterEntitiesByAttributes,
};

const filterEntitiesByAttributes = async (filterCriteria, analytics) => {
  const entities = await Entity.find({
    attributes: {
      comparator: filterCriteria.comparator,
      comparisonValue: filterCriteria.value,
    },
  });

  const entitiesByCode = keyBy(entities, 'code');
  return analytics.filter(({ organisationUnit: orgUnitCode }) => entitiesByCode[orgUnitCode]);
};

export const filterAnalyticsByEntities = async (filterCriteria, analytics) => {
  let filteredAnalytics = analytics;

  if (filterCriteria && FILTERS[filterCriteria.name]) {
    filteredAnalytics = await FILTERS[this.config.customFilter.name](
      this.config.customFilter,
      analytics,
    );
  }

  return filteredAnalytics;
};
