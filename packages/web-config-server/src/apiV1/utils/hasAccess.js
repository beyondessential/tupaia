import { hasAccess, getUserGroupAccessRights } from '@beyondessential/tupaia-access-policy';

/**
 * Check to see whether a given user has access to an organisation unit.
 *
 * @param {object} accessPolicy
 * @param {string} organisationUnitCode
 * @param {array} ancestors
 * @param {string} userGroup
 */
export const hasReportAccessToOrganisationUnit = (
  accessPolicy,
  organisationUnitCode,
  ancestorOrganisationUnitCodes,
  userGroup,
) => {
  // Timor-Leste is temporarily turned off
  if (organisationUnitCode === 'TL' || ancestorOrganisationUnitCodes.includes('TL')) {
    return false;
  }
  return hasAccess(
    accessPolicy,
    'reports',
    [...ancestorOrganisationUnitCodes, organisationUnitCode],
    userGroup,
  );
};

export const getReportUserGroupAccessRightsForOrganisationUnit = (
  accessPolicy,
  organisationUnitCode,
  ancestorOrganisationUnitCodes,
) => {
  // Timor-Leste is temporarily turned off
  if (organisationUnitCode === 'TL' || ancestorOrganisationUnitCodes.includes('TL')) {
    return {};
  }
  return getUserGroupAccessRights(accessPolicy, 'reports', [
    ...ancestorOrganisationUnitCodes,
    organisationUnitCode,
  ]);
};
