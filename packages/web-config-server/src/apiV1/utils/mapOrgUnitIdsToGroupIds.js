export const mapOrgUnitIdsToGroupIds = orgUnitGroups => {
  const orgUnitIdsToGroupIds = {};
  orgUnitGroups.forEach(orgUnitGroup => {
    const { children, id } = orgUnitGroup;
    orgUnitIdsToGroupIds[id] = id;
    children.forEach(child => {
      orgUnitIdsToGroupIds[child.id] = id;
    });
  });
  return orgUnitIdsToGroupIds;
};
