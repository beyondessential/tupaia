export const mapOrgUnitToGroupCodes = orgUnitGroups => {
  const orgUnitIdsToGroupCodes = {};
  orgUnitGroups.forEach(orgUnitGroup => {
    const { children, code } = orgUnitGroup;
    orgUnitIdsToGroupCodes[code] = code;
    children.forEach(child => {
      orgUnitIdsToGroupCodes[child.code] = code;
    });
  });

  return orgUnitIdsToGroupCodes;
};
