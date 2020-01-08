export const mapFacilityToOrgUnitIds = organisationUnits => {
  const facilityToOrgUnitIds = {};
  organisationUnits.forEach(orgUnit => {
    const { children, id } = orgUnit;
    facilityToOrgUnitIds[id] = id;
    children.forEach(child => {
      facilityToOrgUnitIds[child.id] = id;
    });
  });
  return facilityToOrgUnitIds;
};
