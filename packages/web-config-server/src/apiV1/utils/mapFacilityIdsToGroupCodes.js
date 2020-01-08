export const mapFacilityIdsToGroupCodes = organisationUnits => {
  const facilityIdsToGroupCodes = {};
  organisationUnits.forEach(orgUnit => {
    const { children, id, code } = orgUnit;
    facilityIdsToGroupCodes[id] = code;
    children.forEach(child => {
      facilityIdsToGroupCodes[child.id] = code;
    });
  });
  return facilityIdsToGroupCodes;
};
