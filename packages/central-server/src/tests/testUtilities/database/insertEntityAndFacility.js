import { upsertDummyRecord } from '@tupaia/database';
import { getModels } from './getModels';
import { upsertEntity, upsertFacility } from './upsertRecord';

const testModels = getModels();

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
