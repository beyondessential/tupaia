export const parseOrgUnitCodes = (organisationUnitCodes: string | string[] | undefined) => {
  if (!organisationUnitCodes) {
    return [];
  }

  return Array.isArray(organisationUnitCodes)
    ? organisationUnitCodes
    : (organisationUnitCodes as string).split(',');
};
