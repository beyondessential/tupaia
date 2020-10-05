import { EntityModel } from '../../modelClasses/Entity';
import { upsertDummyRecord, getTestDatabase } from '../../testUtilities';

const assertHaveEqualIds = (expectedObject, actualObject) => {
  expect(actualObject).toHaveProperty('id', expectedObject.id);
};

const ORG_UNIT_ENTITY_TYPES = [
  'world',
  'country',
  'district',
  'sub_district',
  'facility',
  'village',
];
const NON_ORG_UNIT_ENTITY_TYPE = 'case';

describe('EntityModel', () => {
  const db = getTestDatabase();
  const entityModel = new EntityModel(db);

  const upsertEntity = data => upsertDummyRecord(entityModel, data);

  const upsertOrgUnitEntity = async data => upsertEntity({ ...data, type: 'facility' });

  const upsertNonOrgUnitEntity = async data =>
    upsertEntity({ ...data, type: NON_ORG_UNIT_ENTITY_TYPE });

  describe('isOrganisationUnit()', () => {
    Promise.all(
      ORG_UNIT_ENTITY_TYPES.map(async type =>
        it(`should return true if its type is ${type}`, async () => {
          const entity = await upsertEntity({ type });
          expect(entity.isOrganisationUnit()).toBe(true);
        }),
      ),
    );

    it('should return false if its type is not an organisation unit type', async () => {
      const entity = await upsertEntity({ type: NON_ORG_UNIT_ENTITY_TYPE });
      expect(entity.isOrganisationUnit()).toBe(false);
    });
  });

  describe('isTrackedEntity()', () => {
    Promise.all(
      ORG_UNIT_ENTITY_TYPES.map(async type =>
        it(`should return false if its type is ${type}`, async () => {
          const entity = await upsertEntity({ type });
          expect(entity.isTrackedEntity()).toBe(false);
        }),
      ),
    );

    it('should return true if its type is not an organisation unit type', async () => {
      const entity = await upsertEntity({ type: NON_ORG_UNIT_ENTITY_TYPE });
      expect(entity.isTrackedEntity()).toBe(true);
    });
  });

  describe('fetchParent()', () => {
    it('should return the parent entity', async () => {
      const parentEntity = await upsertEntity();
      const entity = await upsertEntity({ parent_id: parentEntity.id });

      const result = await entity.fetchParent();
      assertHaveEqualIds(parentEntity, result);
    });
  });

  describe('fetchClosestOrganisationUnit()', () => {
    it('should return itself if it is an organisation unit', async () => {
      const parentEntity = await upsertOrgUnitEntity();
      const entity = await upsertOrgUnitEntity({ parent_id: parentEntity.id });

      const result = await entity.fetchClosestOrganisationUnit();
      assertHaveEqualIds(entity, result);
    });

    it('should return its parent if it is the closest organisation unit', async () => {
      const parentEntity = await upsertOrgUnitEntity();
      const entity = await upsertNonOrgUnitEntity({ parent_id: parentEntity.id });

      const result = await entity.fetchClosestOrganisationUnit();
      assertHaveEqualIds(parentEntity, result);
    });

    it('should return an ancestor other than parent if it is the closest organisation unit', async () => {
      const grandParentEntity = await upsertOrgUnitEntity();
      const parentEntity = await upsertNonOrgUnitEntity({ parent_id: grandParentEntity.id });
      const entity = await upsertNonOrgUnitEntity({ parent_id: parentEntity.id });

      const result = await entity.fetchClosestOrganisationUnit();
      assertHaveEqualIds(grandParentEntity, result);
    });
  });
});
