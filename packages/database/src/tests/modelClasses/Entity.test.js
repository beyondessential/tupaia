import { expect } from 'chai';
import { upsertDummyRecord, getTestModels, findOrCreateDummyRecord } from '../../testUtilities';

const assertHaveEqualIds = (expectedObject, actualObject) => {
  expect(actualObject).to.have.property('id', expectedObject.id);
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

const setupAncestorDescendantRelations = async (
  models,
  childEntity,
  parentEntity,
  grandParentEntity,
) => {
  const { id: hierarchyId } = await findOrCreateDummyRecord(models.entityHierarchy, {
    name: 'explore',
  });
  await upsertDummyRecord(models.ancestorDescendantRelation, {
    ancestor_id: parentEntity.id,
    descendant_id: childEntity.id,
    entity_hierarchy_id: hierarchyId,
    generational_distance: 1,
  });
  if (grandParentEntity) {
    await upsertDummyRecord(models.ancestorDescendantRelation, {
      ancestor_id: grandParentEntity.id,
      descendant_id: childEntity.id,
      entity_hierarchy_id: hierarchyId,
      generational_distance: 2,
    });
    await upsertDummyRecord(models.ancestorDescendantRelation, {
      ancestor_id: grandParentEntity.id,
      descendant_id: parentEntity.id,
      entity_hierarchy_id: hierarchyId,
      generational_distance: 1,
    });
  }
};

describe('EntityModel', () => {
  const models = getTestModels();

  const upsertEntity = data => upsertDummyRecord(models.entity, data);

  const upsertOrgUnitEntity = async data => upsertEntity({ ...data, type: 'facility' });

  const upsertNonOrgUnitEntity = async data =>
    upsertEntity({ ...data, type: NON_ORG_UNIT_ENTITY_TYPE });

  describe('isOrganisationUnit()', () => {
    ORG_UNIT_ENTITY_TYPES.forEach(type => {
      it(`should return true if its type is ${type}`, async () => {
        const entity = await upsertEntity({ type });
        expect(entity.isOrganisationUnit()).to.be.true;
      });
    });

    it('should return false if its type is not an organisation unit type', async () => {
      const entity = await upsertEntity({ type: NON_ORG_UNIT_ENTITY_TYPE });
      expect(entity.isOrganisationUnit()).to.be.false;
    });
  });

  describe('isTrackedEntity()', () => {
    ORG_UNIT_ENTITY_TYPES.forEach(type => {
      it(`should return false if its type is ${type}`, async () => {
        const entity = await upsertEntity({ type });
        expect(entity.isTrackedEntity()).to.be.false;
      });
    });

    it('should return true if its type is not an organisation unit type', async () => {
      const entity = await upsertEntity({ type: NON_ORG_UNIT_ENTITY_TYPE });
      expect(entity.isTrackedEntity()).to.be.true;
    });
  });

  describe('parent()', () => {
    it('should return the parent entity', async () => {
      const parentEntity = await upsertEntity();
      const entity = await upsertEntity({ parent_id: parentEntity.id });

      const result = await entity.parent();
      assertHaveEqualIds(parentEntity, result);
    });
  });

  // todo update these tests to handle traversing alternative hierarchies
  describe('fetchNearestOrgUnitAncestor()', () => {
    it('should return itself if it is an organisation unit', async () => {
      const parentEntity = await upsertOrgUnitEntity();
      const entity = await upsertOrgUnitEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(models, entity, parentEntity);

      const result = await entity.fetchNearestOrgUnitAncestor();
      assertHaveEqualIds(entity, result);
    });

    it('should return its parent if it is the closest organisation unit', async () => {
      const parentEntity = await upsertOrgUnitEntity();
      const entity = await upsertNonOrgUnitEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(models, entity, parentEntity);

      const result = await entity.fetchNearestOrgUnitAncestor();
      assertHaveEqualIds(parentEntity, result);
    });

    it('should return an ancestor other than parent if it is the closest organisation unit', async () => {
      const grandParentEntity = await upsertOrgUnitEntity();
      const parentEntity = await upsertNonOrgUnitEntity({ parent_id: grandParentEntity.id });
      const entity = await upsertNonOrgUnitEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(models, entity, parentEntity, grandParentEntity);

      const result = await entity.fetchNearestOrgUnitAncestor();
      assertHaveEqualIds(grandParentEntity, result);
    });
  });
});
