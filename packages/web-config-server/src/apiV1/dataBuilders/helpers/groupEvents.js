/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Entity } from '/models';

const getOrgUnits = async ({ parentCode, type }) => {
  const parentOrgUnit = await Entity.findOne({ code: parentCode });
  return parentOrgUnit.getDescendantsOfType(type);
};

const groupByAllOrgUnitNames = async (events, options) => {
  const eventsByOrgUnitName = (await getOrgUnits(options)).reduce(
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

const groupByAllOrgUnitParentNames = async (events, options) => {
  const { aggregationLevel } = options;
  const orgUnits = await getOrgUnits(options);
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

const GROUP_BY_VALUE_TO_METHOD = {
  allOrgUnitNames: groupByAllOrgUnitNames,
  allOrgUnitParentNames: groupByAllOrgUnitParentNames,
};

export const groupEvents = async (events, groupBySpecs = {}) => {
  const { type, options } = groupBySpecs;
  const groupByMethod = GROUP_BY_VALUE_TO_METHOD[type];
  if (!groupByMethod) {
    throw new Error(`'${type}' is not a supported groupBy type`);
  }

  return groupByMethod(events, options);
};
