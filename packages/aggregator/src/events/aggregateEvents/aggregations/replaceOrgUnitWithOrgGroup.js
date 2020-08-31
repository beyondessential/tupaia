/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export const replaceOrgUnitWithOrgGroup = (events, aggregationConfig) => {
  const { orgUnitMap = {} } = aggregationConfig;
  return events.map(event => {
    const { code, name } = orgUnitMap[event.orgUnit] || {};
    const orgUnit = code || event.orgUnit;
    const orgUnitName = name || event.orgUnitName;
    return { ...event, orgUnit, orgUnitName };
  });
};
