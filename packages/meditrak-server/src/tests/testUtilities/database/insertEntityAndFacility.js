import { ENTITY_TYPES } from '../../../database/models/Entity';
import { TestableApp } from '../../TestableApp';
import { upsertEntity, upsertFacility } from './upsertRecord';

const { FACILITY } = ENTITY_TYPES;

const testModels = new TestableApp().models;

export const insertEntityAndFacility = async (
  { entity: entityData, facility: facilityData },
  models = testModels,
) => {
  const country = await models.country.findOne();
  const entity = await upsertEntity({ ...entityData, type: FACILITY });
  const area = await models.geographicalArea.findOne({ country_id: country.id });
  const facility = await upsertFacility({
    ...facilityData,
    code: entity.code,
    country_id: country.id,
    geographical_area_id: area.id,
  });

  return { entity, facility };
};
