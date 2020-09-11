// get all Children on a particular level from a parent organisation unit
export default async (dhisApi, entity, dhisLevel) => {
  const jsonQueryOrgUnits = {
    filter: {
      'ancestors.code': entity.code,
    },
    level: dhisLevel,
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
