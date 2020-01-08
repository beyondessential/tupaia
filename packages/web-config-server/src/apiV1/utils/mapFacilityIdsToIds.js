export const mapFacilityIdsToIds = organisationUnits => {
  const facilityIdsToIds = {};
  organisationUnits.forEach(orgUnit => {
    const { children, id } = orgUnit;
    facilityIdsToIds[id] = id;
    children.forEach(child => {
      facilityIdsToIds[child.id] = id;
    });
  });
  return facilityIdsToIds;
};
