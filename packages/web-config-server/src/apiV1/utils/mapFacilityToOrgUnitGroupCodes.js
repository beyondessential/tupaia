export const mapFacilityToOrgUnitGroupCodes = organisationUnits => {
  const facilityToGroupCodes = {};
  organisationUnits.forEach(orgUnit => {
    const { children, id, code } = orgUnit;
    facilityToGroupCodes[id] = code;
    children.forEach(child => {
      facilityToGroupCodes[child.id] = code;
    });
  });
  return facilityToGroupCodes;
};
