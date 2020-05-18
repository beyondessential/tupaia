import { upsertDummyRecord } from '@tupaia/database';
import { TestableApp } from '../../TestableApp';
import { upsertEntity, upsertFacility } from './upsertRecord';

const testModels = new TestableApp().models;

export const insertEntityAndFacility = async (
  { entity: entityData, facility: facilityData },
  models = testModels,
) => {
  const country = await upsertDummyRecord(models.country);
  const entity = await upsertEntity({ ...entityData, type: models.entity.types.FACILITY });
  const area = await upsertDummyRecord(models.geographicalArea, { country_id: country.id });
  const facility = await upsertFacility({
    ...facilityData,
    code: entity.code,
    country_id: country.id,
    geographical_area_id: area.id,
  });

  return { entity, facility };
};
