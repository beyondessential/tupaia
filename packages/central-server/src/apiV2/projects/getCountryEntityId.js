/**
 * Resolve a `country` table id to its shared country entity's id. project_country
 * links projects to country *entities* (entity.id), but the admin-panel works in
 * terms of `country` table ids, so both create and edit translate via this.
 */
export const getCountryEntityId = async (models, countryId) => {
  const country = await models.country.findOne({ id: countryId });
  if (!country) throw new Error(`Country with id ${countryId} not found`);

  const entity = await models.entity.findOne({ code: country.code, type: 'country' });
  if (!entity) throw new Error(`Entity with code ${country.code} not found`);

  return entity.id;
};
