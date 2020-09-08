/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getEventsThatSatisfyConditions } from './checkAgainstConditions';

const getOrgUnits = async (models, { parentCode, type }) => {
  const parentOrgUnit = await models.entity.findOne({ code: parentCode });
  return parentOrgUnit.getDescendantsOfType(type);
};

const groupByAllOrgUnitNames = async (events, options, models) => {
  const eventsByOrgUnitName = (await getOrgUnits(models, options)).reduce(
    (results, { name }) => ({ ...results, [name]: [] }),
    {},
  );

  events.forEach(event => {
    const { orgUnitName } = event;
    if (eventsByOrgUnitName[orgUnitName]) {
      eventsByOrgUnitName[orgUnitName].push(event);
    }
  });
  return eventsByOrgUnitName;
};

const groupByAllOrgUnitParentNames = async (events, options, models) => {
  const { aggregationLevel } = options;
  const orgUnits = await getOrgUnits(models, options);
  const eventsByOrgUnitName = orgUnits.reduce(
    (results, { name }) => ({ ...results, [name]: [] }),
    {},
  );
  const allOrgUnitsByOrgUnitName = {};
  /*format:
   * {
   *  "village1": "facility1",
   *  "village2": "facility2",
   *  "village3": "facility1"
   * }
   */
  await Promise.all(
    orgUnits.map(async parentOrgUnit => {
      const { name } = parentOrgUnit;
      const childrenAndSelf = await parentOrgUnit.getDescendantsOfType(aggregationLevel);
      childrenAndSelf.forEach(orgUnit => {
        allOrgUnitsByOrgUnitName[orgUnit.name] = name;
      });
    }),
  );

  events.forEach(event => {
    const { orgUnitName } = event;
    if (allOrgUnitsByOrgUnitName[orgUnitName]) {
      eventsByOrgUnitName[allOrgUnitsByOrgUnitName[orgUnitName]].push(event);
    }
  });

  return eventsByOrgUnitName;
};

const groupByDataValues = (events, options) => {
  const groupedEvents = {};
  for (const groupingName of Object.keys(options)) {
    groupedEvents[groupingName] = getEventsThatSatisfyConditions(events, options[groupingName]);
  }
  return groupedEvents;
};

const GROUP_BY_VALUE_TO_METHOD = {
  allOrgUnitNames: groupByAllOrgUnitNames,
  allOrgUnitParentNames: groupByAllOrgUnitParentNames,
  nothing: events => {
    return { all: events };
  }, // used for testing
  dataValues: groupByDataValues,
};

/**
 * @param {array} events
 * @param {object} groupBySpecs
 * @returns {Promise<object>} object of groupName => eventsForGroup
 */
export const groupEvents = async (models, events, groupBySpecs = {}) => {
  const { type, options } = groupBySpecs;
  const groupByMethod = GROUP_BY_VALUE_TO_METHOD[type];
  if (!groupByMethod) {
    throw new Error(`'${type}' is not a supported groupBy type`);
  }

  return groupByMethod(events, options, models);
};

/**
 * @param {object} groupBySpecs
 * @returns {array<string>} data element codes used in this grouping config
 */
export const getAllDataElementCodes = groupBySpecs => {
  if (groupBySpecs.type === 'dataValues') {
    let allDataElementCodes = [];
    Object.values(groupBySpecs.options).forEach(grouping => {
      allDataElementCodes = [...allDataElementCodes, ...Object.keys(grouping.dataValues)];
    });
    return allDataElementCodes;
  }
  return [];
};
