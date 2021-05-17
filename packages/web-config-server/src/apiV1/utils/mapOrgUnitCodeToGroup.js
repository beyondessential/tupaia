export const mapOrgUnitCodeToGroup = orgUnitGroups => {
  const orgUnitToGroupCodes = {};
  orgUnitGroups.forEach(orgUnitGroup => {
    const { children, code, name } = orgUnitGroup;
    orgUnitToGroupCodes[code] = code;
    children.forEach(child => {
      orgUnitToGroupCodes[child.code] = { name, code };
    });
  });

  return orgUnitToGroupCodes;
};
