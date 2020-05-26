import { Entity } from '/models';
import keyBy from 'lodash.keyby';

const filterSchoolEntitiesByAttributes = async (filterCriteria, analytics) => {
  const entities = await Entity.find({
    attributes: {
      comparator: filterCriteria.comparator,
      comparisonValue: filterCriteria.value,
    },
    type: {
      comparator: '=',
      comparisonValue: 'school',
    },
  });

  const entitiesByCode = keyBy(entities, 'code');
  return analytics.filter(({ organisationUnit: orgUnitCode }) => entitiesByCode[orgUnitCode]);
};

const FILTERS = {
  filterSchoolEntitiesByAttributes,
};

export const filterAnalyticsByEntities = async (filterCriteria, analytics) => {
  let filteredAnalytics = analytics;

  if (filterCriteria && FILTERS[filterCriteria.name]) {
    filteredAnalytics = await FILTERS[filterCriteria.name](filterCriteria, analytics);
  }

  return filteredAnalytics;
};
