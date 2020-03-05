/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Entity } from '/models';

const groupByAllOrgUnitNames = async (events, { parentCode, type }) => {
  const parentOrgUnit = await Entity.findOne({ code: parentCode });
  const orgUnits = await parentOrgUnit.getDescendantsOfType(type);

  const eventsByOrgUnitName = orgUnits.reduce(
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

const GROUP_BY_VALUE_TO_METHOD = {
  allOrgUnitNames: groupByAllOrgUnitNames,
};

export const groupEvents = async (events, groupBySpecs = {}) => {
  const { type, options } = groupBySpecs;
  const groupByMethod = GROUP_BY_VALUE_TO_METHOD[type];
  if (!groupByMethod) {
    throw new Error(`'${type}' is not a supported groupBy type`);
  }

  return groupByMethod(events, options);
};
