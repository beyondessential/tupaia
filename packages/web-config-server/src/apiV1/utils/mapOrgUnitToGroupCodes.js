export const mapOrgUnitToGroupCodes = orgUnitGroups => {
  const orgUnitToGroupCodes = {};
  orgUnitGroups.forEach(orgUnitGroup => {
    const { children, code } = orgUnitGroup;
    orgUnitToGroupCodes[code] = code;
    children.forEach(child => {
      orgUnitToGroupCodes[child.code] = code;
    });
  });

  return orgUnitToGroupCodes;
};
