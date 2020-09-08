// get all Children on a particular level from a parent organisation unit
export default async (models, entity, childType, dhisApi) => {
  const jsonQueryOrgUnits = {
    filter: {
      'ancestors.code': entity.code,
    },
    level: models.entity.getDhisLevel(childType),
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
