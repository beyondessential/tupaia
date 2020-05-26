/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

const ENTITY_AGGREGATION_TYPES = {
  SUM: 'SUM',
  SUM_YES: 'SUM_YES',
  RAW: 'RAW',
};

export class ResponseBuilder {
  constructor(data, dataType, routeHandler) {
    this.data = data;
    this.dataType = dataType;
    this.routeHandler = routeHandler;
  }

  async build() {
    const { results } = this.data;

    // No need to build anything if there is no data
    if (!results || results.length === 0) return this.data;

    const orgUnitToAncestor = await this.routeHandler.getOrgUnitToAncestorMap(results);

    console.log(this.dataType);
    if (this.dataType === 'analytics') {
      // No replacements to make
      if (Object.keys(orgUnitToAncestor).length === 0) return this.data;
      console.log(this.data);
      return {
        ...this.data,
        results: await this.aggregateAnalyticsToEntityType(
          results,
          this.routeHandler.entityAggregationType,
          orgUnitToAncestor,
        ),
      };
    }
    // doesn't aggregate events yet
    return this.data;
  }

  aggregateAnalyticsToEntityType = async (analytics, entityAggregationType, orgUnitToAncestor) => {
    switch (entityAggregationType) {
      case ENTITY_AGGREGATION_TYPES.SUM_YES:
        return sumToAncestor(analytics, orgUnitToAncestor, value => (value === 'Yes' ? 1 : 0));
      case ENTITY_AGGREGATION_TYPES.SUM:
        return sumToAncestor(analytics, orgUnitToAncestor);
      case ENTITY_AGGREGATION_TYPES.RAW:
      default:
        return replaceChildrenWithAncestors(analytics, orgUnitToAncestor);
    }
  };
}

/**
 * Add the analytics together across org units AND periods
 * with just one analytic per data element/ancestor pair
 *
 * @param {Array} analytics
 * @param {Array}
 */
const sumToAncestor = async (analytics, orgUnitToAncestor, valueMapper = value => value) => {
  const summedAnalytics = [];
  analytics.forEach(responseElement => {
    const organisationUnit = orgUnitToAncestor[responseElement.organisationUnit];
    const indexOfEquivalentResponseElement = summedAnalytics.findIndex(
      otherResponseElement =>
        responseElement.dataElement === otherResponseElement.dataElement &&
        organisationUnit === otherResponseElement.organisationUnit,
    );
    // If there are no matching response elements already being returned, add it
    const value = valueMapper(responseElement.value);
    if (indexOfEquivalentResponseElement < 0) {
      summedAnalytics.push({ ...responseElement, value, organisationUnit });
    } else {
      summedAnalytics[indexOfEquivalentResponseElement].value += value;
    }
  });
  return summedAnalytics;
};

const replaceChildrenWithAncestors = async (analytics, orgUnitToAncestor) => {
  return analytics.map(responseElement => {
    const organisationUnit = orgUnitToAncestor[responseElement.organisationUnit];
    return { ...responseElement, organisationUnit };
  });
};
