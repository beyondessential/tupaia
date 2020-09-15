/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { findOrCreateDummyRecord } from './upsertDummyRecord';

export const findOrCreateDummyCountryEntity = async (
  models,
  { code, name, ...countryEntityProps },
) => {
  const entity = await findOrCreateDummyRecord(
    models.entity,
    {
      code,
      country_code: code,
    },
    { name, type: 'country', ...countryEntityProps },
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
