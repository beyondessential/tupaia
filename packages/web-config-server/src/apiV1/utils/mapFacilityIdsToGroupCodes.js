export const mapFacilityIdsToGroupCodes = organisationUnits => {
  const facilityIdsToGroupCodes = {};
  organisationUnits.forEach(orgUnit => {
    const { children, id } = orgUnit;
    facilityIdsToGroupCodes[id] = id;
    children.forEach(child => {
      facilityIdsToGroupCodes[child.id] = id;
    });
  });
  return facilityIdsToGroupCodes;
};
