import { findOrCreateDummyRecord } from './upsertDummyRecord';

export const findOrCreateDummyCountryEntity = async (
  models,
  { code, name, ...countryEntityProps },
) => {
  const entity = await findOrCreateDummyRecord(
    models.entity,
    {
      code,
    },
    { name, country_code: code, type: 'country', ...countryEntityProps },
  );
  const country = await findOrCreateDummyRecord(
    models.country,
    {
      code,
    },
    { name },
  );

  return { entity, country };
};
