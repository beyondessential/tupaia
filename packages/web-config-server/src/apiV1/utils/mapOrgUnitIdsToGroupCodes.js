export const mapOrgUnitIdsToGroupCodes = orgUnitGroups => {
  const orgUnitIdsToGroupCodes = {};
  orgUnitGroups.forEach(orgUnitGroup => {
    const { children, id, code } = orgUnitGroup;
    orgUnitIdsToGroupCodes[id] = code;
    children.forEach(child => {
      orgUnitIdsToGroupCodes[child.id] = code;
    });
  });
  return orgUnitIdsToGroupCodes;
};
