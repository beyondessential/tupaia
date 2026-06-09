import { upsertDummyRecord, getTestModels, findOrCreateDummyRecord } from '../../server/testUtilities';

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

const setupAncestorDescendantRelations = async (
  models,
  childEntity,
  parentEntity,
  grandparentEntity,
  hierarchyName = 'explore',
) => {
  const { id: hierarchyId } = await findOrCreateDummyRecord(models.entityHierarchy, {
    name: hierarchyName,
  });
  await upsertDummyRecord(models.ancestorDescendantRelation, {
    ancestor_id: parentEntity.id,
    descendant_id: childEntity.id,
    entity_hierarchy_id: hierarchyId,
    generational_distance: 1,
  });
  if (grandparentEntity) {
    await upsertDummyRecord(models.ancestorDescendantRelation, {
      ancestor_id: grandparentEntity.id,
      descendant_id: childEntity.id,
      entity_hierarchy_id: hierarchyId,
      generational_distance: 2,
    });
    await upsertDummyRecord(models.ancestorDescendantRelation, {
      ancestor_id: grandparentEntity.id,
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
        expect(entity.isOrganisationUnit()).toBe(true);
      });
    });

    it('should return false if its type is not an organisation unit type', async () => {
      const entity = await upsertEntity({ type: NON_ORG_UNIT_ENTITY_TYPE });
      expect(entity.isOrganisationUnit()).toBe(false);
    });
  });

  describe('isTrackedEntity()', () => {
    ORG_UNIT_ENTITY_TYPES.forEach(type => {
      it(`should return false if its type is ${type}`, async () => {
        const entity = await upsertEntity({ type });
        expect(entity.isTrackedEntity()).toBe(false);
      });
    });

    it('should return true if its type is not an organisation unit type', async () => {
      const entity = await upsertEntity({ type: NON_ORG_UNIT_ENTITY_TYPE });
      expect(entity.isTrackedEntity()).toBe(true);
    });
  });

  describe('getParent(hierarchyId)', () => {
    it('should return the parent entity', async () => {
      const parentEntity = await upsertEntity();
      const entity = await upsertEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(models, entity, parentEntity);
      const exploreHierarchy = await models.entityHierarchy.findOne({ name: 'explore' });

      const result = await entity.getParent(exploreHierarchy.id);
      assertHaveEqualIds(parentEntity, result);
    });

    it('should return the parent entity for the correct hierarchy', async () => {
      const exploreParentEntity = await upsertEntity();
      const lilyParentEntity = await upsertEntity();
      const entity = await upsertEntity({ parent_id: exploreParentEntity.id });
      await setupAncestorDescendantRelations(models, entity, exploreParentEntity);
      await setupAncestorDescendantRelations(models, entity, lilyParentEntity, undefined, 'lily');
      const exploreHierarchy = await models.entityHierarchy.findOne({ name: 'explore' });
      const lilyHierarchy = await models.entityHierarchy.findOne({ name: 'lily' });

      const exploreParentResult = await entity.getParent(exploreHierarchy.id);
      const lilyParentResult = await entity.getParent(lilyHierarchy.id);
      assertHaveEqualIds(exploreParentEntity, exploreParentResult);
      assertHaveEqualIds(lilyParentEntity, lilyParentResult);
    });
  });

  describe('fetchNearestOrgUnitAncestor()', () => {
    it('returns itself if it is an organisation unit', async () => {
      const parentEntity = await upsertOrgUnitEntity();
      const entity = await upsertOrgUnitEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(models, entity, parentEntity);

      const result = await entity.fetchNearestOrgUnitAncestor();
      assertHaveEqualIds(entity, result);
    });

    it('returns its parent if it is the closest organisation unit', async () => {
      const parentEntity = await upsertOrgUnitEntity();
      const entity = await upsertNonOrgUnitEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(models, entity, parentEntity);

      const result = await entity.fetchNearestOrgUnitAncestor();
      assertHaveEqualIds(parentEntity, result);
    });

    it('returns an ancestor other than parent if it is the closest organisation unit', async () => {
      const grandparentEntity = await upsertOrgUnitEntity();
      const parentEntity = await upsertNonOrgUnitEntity({ parent_id: grandparentEntity.id });
      const entity = await upsertNonOrgUnitEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(models, entity, parentEntity, grandparentEntity);

      const result = await entity.fetchNearestOrgUnitAncestor();
      assertHaveEqualIds(grandparentEntity, result);
    });

    it('fetches ancestors based on the hierarchy id specified', async () => {
      const grandparentInExploreHierarchy = await upsertOrgUnitEntity();
      const grandparentInLilyHierarchy = await upsertOrgUnitEntity();
      const parentEntity = await upsertNonOrgUnitEntity({
        parent_id: grandparentInExploreHierarchy.id,
      });
      const entity = await upsertNonOrgUnitEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(
        models,
        entity,
        parentEntity,
        grandparentInExploreHierarchy,
        'explore',
      );
      await setupAncestorDescendantRelations(
        models,
        entity,
        parentEntity,
        grandparentInLilyHierarchy,
        'lily',
      );

      const lilyHierarchy = await models.entityHierarchy.findOne({ name: 'lily' });
      const result = await entity.fetchNearestOrgUnitAncestor(lilyHierarchy.id);
      assertHaveEqualIds(grandparentInLilyHierarchy, result);
    });

    it('fetches ancestors using the explore hierarchy by default', async () => {
      const grandparentInExploreHierarchy = await upsertOrgUnitEntity();
      const grandparentInLilyHierarchy = await upsertOrgUnitEntity();
      const parentEntity = await upsertNonOrgUnitEntity({
        parent_id: grandparentInExploreHierarchy.id,
      });
      const entity = await upsertNonOrgUnitEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(
        models,
        entity,
        parentEntity,
        grandparentInExploreHierarchy,
        'explore',
      );
      await setupAncestorDescendantRelations(
        models,
        entity,
        parentEntity,
        grandparentInLilyHierarchy,
        'lily',
      );

      const result = await entity.fetchNearestOrgUnitAncestor();
      assertHaveEqualIds(grandparentInExploreHierarchy, result);
    });

    it('fetches ancestors using another hierarchy if the entity is not present in explore', async () => {
      const grandparentInExploreHierarchy = await upsertOrgUnitEntity();
      const grandparentInLilyHierarchy = await upsertOrgUnitEntity();
      const parentEntity = await upsertNonOrgUnitEntity({
        parent_id: grandparentInExploreHierarchy.id,
      });
      const entity = await upsertNonOrgUnitEntity({ parent_id: parentEntity.id });
      await setupAncestorDescendantRelations(
        models,
        entity,
        parentEntity,
        grandparentInLilyHierarchy,
        'lily',
      );

      const result = await entity.fetchNearestOrgUnitAncestor();
      assertHaveEqualIds(grandparentInLilyHierarchy, result);
    });
  });
});
