/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export const replaceOrgUnitWithOrgGroup = (events, aggregationConfig) => {
  const { orgUnitMap = {} } = aggregationConfig;
  return events.map(responseElement => {
    const { code, name } = orgUnitMap[responseElement.orgUnit] || {};
    const orgUnit = code || responseElement.orgUnit;
    const orgUnitName = name || responseElement.orgUnitName;
    return { ...responseElement, orgUnit, orgUnitName };
  });
};
