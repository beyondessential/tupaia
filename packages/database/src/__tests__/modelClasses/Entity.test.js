import {
  upsertDummyRecord,
  getTestModels,
  findOrCreateDummyRecord,
} from '../../server/testUtilities';

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
  projectCode = 'explore',
) => {
  const { id: projectId } = await findOrCreateDummyRecord(models.project, {
    code: projectCode,
  });
  await upsertDummyRecord(models.ancestorDescendantRelation, {
    ancestor_id: parentEntity.id,
    descendant_id: childEntity.id,
    project_id: projectId,
    generational_distance: 1,
  });
  if (grandparentEntity) {
    await upsertDummyRecord(models.ancestorDescendantRelation, {
      ancestor_id: grandparentEntity.id,
      descendant_id: childEntity.id,
      project_id: projectId,
      generational_distance: 2,
    });
    await upsertDummyRecord(models.ancestorDescendantRelation, {
      ancestor_id: grandparentEntity.id,
      descendant_id: parentEntity.id,
      project_id: projectId,
      generational_distance: 1,
    });
  }
  return projectId;
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

  describe('getParent(projectId)', () => {
    it('should return the parent entity', async () => {
      const parentEntity = await upsertEntity();
      const entity = await upsertEntity({ parent_id: parentEntity.id });
      const projectId = await setupAncestorDescendantRelations(models, entity, parentEntity);

      const result = await entity.getParent(projectId);
      assertHaveEqualIds(parentEntity, result);
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
  });

  describe('findOneByCodeInProject(code, projectId)', () => {
    // Each scenario uses a fresh unique code so parallel test runs don't
    // collide on the (code, project_id) unique constraint.
    const uniqueCode = () => `findOneByCodeInProject_test_${Math.random().toString(36).slice(2)}`;

    const createProject = async () =>
      findOrCreateDummyRecord(models.project, { code: uniqueCode() });

    describe('null projectId (deterministic fallback)', () => {
      it('returns the shared row when only a project_id IS NULL row exists', async () => {
        const code = uniqueCode();
        const shared = await upsertEntity({ code, project_id: null });

        const result = await models.entity.findOneByCodeInProject(code, null);
        assertHaveEqualIds(shared, result);
      });

      it('returns the project-specific row when no shared row exists', async () => {
        const code = uniqueCode();
        const project = await createProject();
        const projectRow = await upsertEntity({ code, project_id: project.id });

        const result = await models.entity.findOneByCodeInProject(code, null);
        assertHaveEqualIds(projectRow, result);
      });

      it('prefers the shared row over any project-specific row', async () => {
        const code = uniqueCode();
        const projectA = await createProject();
        const projectB = await createProject();
        const shared = await upsertEntity({ code, project_id: null });
        await upsertEntity({ code, project_id: projectA.id });
        await upsertEntity({ code, project_id: projectB.id });

        const result = await models.entity.findOneByCodeInProject(code, null);
        assertHaveEqualIds(shared, result);
      });

      it('returns the lowest-id project row when only project-specific rows exist', async () => {
        const code = uniqueCode();
        const projectA = await createProject();
        const projectB = await createProject();
        const firstInserted = await upsertEntity({ code, project_id: projectA.id });
        const secondInserted = await upsertEntity({ code, project_id: projectB.id });

        // Sanity check: `id` is timestamp-prefixed, so the earlier insert has
        // the lower id and is therefore the canonical row.
        expect(firstInserted.id < secondInserted.id).toBe(true);

        const result = await models.entity.findOneByCodeInProject(code, null);
        assertHaveEqualIds(firstInserted, result);
      });
    });

    describe('explicit projectId', () => {
      it("returns the project's own row when one exists alongside another project's row", async () => {
        const code = uniqueCode();
        const projectA = await createProject();
        const projectB = await createProject();
        await upsertEntity({ code, project_id: projectA.id });
        const inProjectB = await upsertEntity({ code, project_id: projectB.id });

        const result = await models.entity.findOneByCodeInProject(code, projectB.id);
        assertHaveEqualIds(inProjectB, result);
      });

      it('falls back to the shared row when no project-specific row exists', async () => {
        const code = uniqueCode();
        const project = await createProject();
        const shared = await upsertEntity({ code, project_id: null });

        const result = await models.entity.findOneByCodeInProject(code, project.id);
        assertHaveEqualIds(shared, result);
      });
    });
  });
});
