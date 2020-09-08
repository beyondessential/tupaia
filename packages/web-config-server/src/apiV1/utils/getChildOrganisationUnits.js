// get all Children on a particular level from a parent organisation unit
export default async ({ organisationUnitGroupCode, type }, dhisApi) => {
  const jsonQueryOrgUnits = {
    filter: {
      'ancestors.code': organisationUnitGroupCode,
    },
    level: Entity.getDhisLevel(type),
    fields: [
      'id',
      'organisationUnitCode',
      'code',
      'name',
      'comment',
      'description',
      'children[id]',
      'children[code]',
      'children[level]',
    ],
  };
  return dhisApi.getOrganisationUnits(jsonQueryOrgUnits);
};
