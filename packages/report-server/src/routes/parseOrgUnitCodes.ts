/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const parseOrgUnitCodes = (organisationUnitCodes: string | string[] | undefined) => {
  if (!organisationUnitCodes) {
    return [];
  }

  return Array.isArray(organisationUnitCodes)
    ? organisationUnitCodes
    : (organisationUnitCodes as string).split(',');
};
