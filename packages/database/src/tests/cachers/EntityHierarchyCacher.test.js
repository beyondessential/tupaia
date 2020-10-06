/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';
import { expect } from 'chai';
import { sleep } from '@tupaia/utils';
import {
  getTestModels,
  populateTestData,
  clearTestData,
  upsertDummyRecord,
} from '../../testUtilities';
import { EntityHierarchyCacher } from '../../cachers/EntityHierarchyCacher';

import {
  TEST_DATA,
  INITIAL_HIERARCHY_A,
  INITIAL_HIERARCHY_B,
  HIERARCHY_B_AFTER_ENTITY_AAA_DELETED,
  HIERARCHY_B_AFTER_MULTIPLE_ENTITIES_DELETED,
  HIERARCHY_B_AFTER_RELATION_ABA_AAA_DELETED,
  HIERARCHY_B_AFTER_MULTIPLE_RELATIONS_DELETED,
  HIERARCHY_A_AFTER_PARENT_ID_CHANGES,
  HIERARCHY_B_AFTER_PARENT_ID_CHANGES,
  HIERARCHY_B_AFTER_MULTIPLE_RELATIONS_CHANGED,
  HIERARCHY_B_AFTER_ENTITY_RELATION_ADDED,
  HIERARCHY_A_AFTER_ENTITIES_CREATED,
  HIERARCHY_B_AFTER_ENTITIES_CREATED,
} from './EntityHierarchyCacher.fixtures';

describe('EntityHierarchyCacher', () => {
  const models = getTestModels();
  const hierarchyCacher = new EntityHierarchyCacher(models);

  const buildAndCacheProject = async projectCode => {
    const project = await models.project.findOne({ code: projectCode });
    await hierarchyCacher.buildAndCacheProject(project);
  };
  const assertRelationsMatch = async (projectCode, relations) => {
    await models.database.waitForAllChangeHandlers();
    const project = await models.project.findOne({ code: projectCode });
    const { entity_hierarchy_id: hierarchyId } = project;
    const relationsForProject = await models.ancestorDescendantRelation.find({
      entity_hierarchy_id: hierarchyId,
    });
    expect(
      relationsForProject.map(r => ({
        ancestor_id: r.ancestor_id,
        descendant_id: r.descendant_id,
        generational_distance: r.generational_distance,
      })),
    ).to.deep.equalInAnyOrder(relations);
  };

  beforeEach(async () => {
    hierarchyCacher.stopListeningForChanges();
    await populateTestData(models, TEST_DATA);
    await buildAndCacheProject('project_a_test');
    await buildAndCacheProject('project_b_test');

    // start listening for changes
    hierarchyCacher.listenForChanges();
  });

  afterEach(async () => {
    await clearTestData(models.database);
  });

  describe('buildAndCacheProject', async () => {
    const assertProjectRelationsCorrectlyBuilt = async (projectCode, expected) => {
      await assertRelationsMatch(projectCode, expected);
    };
    it('handles a hierarchy that is fully canonical', async () => {
      await assertProjectRelationsCorrectlyBuilt('project_a_test', INITIAL_HIERARCHY_A);
    });
    it('handles a hierarchy that has entity relation links', async () => {
      await assertProjectRelationsCorrectlyBuilt('project_b_test', INITIAL_HIERARCHY_B);
    });
  });

  it('deletes all ancestor descendant relations if an entity is deleted', async () => {
    // delete an entity, and make sure its ancestor descendant relations are all deleted
    const entityToDelete = 'entity_aaa_test';
    await models.entityRelation.delete({ child_id: entityToDelete }); // can't delete entity until entity relation is gone
    await models.entity.delete({ id: entityToDelete });
    await assertRelationsMatch('project_b_test', HIERARCHY_B_AFTER_ENTITY_AAA_DELETED);
  });

  it('deletes all ancestor descendant relations if multiple entities are deleted', async () => {
    // delete a few entities, and make sure their relations are deleted
    const entitiesToDelete = [
      'entity_ab_test',
      'entity_aaa_test',
      'entity_aba_test',
      'entity_abb_test',
    ];
    await models.entityRelation.delete({ parent_id: entitiesToDelete });
    await models.entityRelation.delete({ child_id: entitiesToDelete });
    await models.entity.delete({ id: entitiesToDelete });
    await assertRelationsMatch('project_b_test', HIERARCHY_B_AFTER_MULTIPLE_ENTITIES_DELETED);
  });

  it('deletes all ancestor descendant relations if an entity relation record is deleted', async () => {
    // delete an entity relation, and make sure the relations in the cache are deleted
    const entityRelationToDelete = {
      parent_id: 'entity_aba_test',
      child_id: 'entity_aaa_test',
      entity_hierarchy_id: 'hierarchy_b_test',
    };
    await models.entityRelation.delete(entityRelationToDelete);
    await assertRelationsMatch('project_b_test', HIERARCHY_B_AFTER_RELATION_ABA_AAA_DELETED);
  });

  it('deletes all ancestor descendant relations if multiple entity relation records are deleted', async () => {
    // delete a few entity relations, and make sure the relations in the cache are deleted
    // strangely enough, after deleting a -> aa, it means the canonical structure takes back over
    const entityRelationsToDelete = [
      {
        parent_id: 'entity_aba_test',
        child_id: 'entity_aaa_test',
        entity_hierarchy_id: 'hierarchy_b_test',
      },
      {
        parent_id: 'entity_aa_test',
        child_id: 'entity_ab_test',
        entity_hierarchy_id: 'hierarchy_b_test',
      },
    ];
    await Promise.all(
      entityRelationsToDelete.map(async entityRelation =>
        models.entityRelation.delete(entityRelation),
      ),
    );
    await assertRelationsMatch('project_b_test', HIERARCHY_B_AFTER_MULTIPLE_RELATIONS_DELETED);
  });

  it('deletes and rebuilds subtrees across all hierarchies if a parent_id is changed', async () => {
    // update the parent_id of an entity, and make sure the subtree in the database is rebuilt
    await models.entity.updateById('entity_aaa_test', { parent_id: 'entity_a_test' });
    await models.entity.updateById('entity_abb_test', { parent_id: 'entity_aaa_test' });
    await assertRelationsMatch('project_a_test', HIERARCHY_A_AFTER_PARENT_ID_CHANGES);
    await assertRelationsMatch('project_b_test', HIERARCHY_B_AFTER_PARENT_ID_CHANGES);
  });

  it('deletes and rebuilds a subtree if entity relation records are changed', async () => {
    // change ab to sit below aab instead of aa
    await models.entityRelation.update(
      {
        parent_id: 'entity_aa_test',
        child_id: 'entity_ab_test',
        entity_hierarchy_id: 'hierarchy_b_test',
      },
      { parent_id: 'entity_aab_test' },
    );
    // change aab to sit below aa instead of abb
    await models.entityRelation.update(
      {
        parent_id: 'entity_abb_test',
        child_id: 'entity_aab_test',
        entity_hierarchy_id: 'hierarchy_b_test',
      },
      { parent_id: 'entity_aa_test' },
    );
    await assertRelationsMatch('project_b_test', HIERARCHY_B_AFTER_MULTIPLE_RELATIONS_CHANGED);
  });

  it('adds a new subtree if entity relation records are added', async () => {
    // change ab to sit below aab instead of aa
    await models.entityRelation.create({
      parent_id: 'entity_ab_test',
      child_id: 'entity_aba_test',
      entity_hierarchy_id: 'hierarchy_b_test',
    });
    await assertRelationsMatch('project_b_test', HIERARCHY_B_AFTER_ENTITY_RELATION_ADDED);
  });

  it('adds new subtrees if an entities are created', async () => {
    // update the parent_id of an entity, and make sure the subtree in the database is rebuilt
    await upsertDummyRecord(models.entity, { id: 'entity_ac_test', parent_id: 'entity_a_test' });
    await upsertDummyRecord(models.entity, { id: 'entity_aca_test', parent_id: 'entity_ac_test' });
    await upsertDummyRecord(models.entity, { id: 'entity_abc_test', parent_id: 'entity_ab_test' });
    await upsertDummyRecord(models.entity, {
      id: 'entity_aaaa_test',
      parent_id: 'entity_aaa_test',
    });
    await assertRelationsMatch('project_a_test', HIERARCHY_A_AFTER_ENTITIES_CREATED);
    await assertRelationsMatch('project_b_test', HIERARCHY_B_AFTER_ENTITIES_CREATED);
  });

  it('batches multiple changes', async () => {
    sinon.stub(EntityHierarchyCacher.prototype, 'buildAndCacheHierarchies');

    // make a bunch of different changes, with small delays between each to model real life
    const sleepTime = 250; // sleep for 250 ms between each change

    // create an entity
    await upsertDummyRecord(models.entity, { id: 'entity_ac_test', parent_id: 'entity_a_test' });
    await sleep(sleepTime);

    // update an entity relation
    await models.entityRelation.update(
      {
        parent_id: 'entity_aa_test',
        child_id: 'entity_ab_test',
        entity_hierarchy_id: 'hierarchy_b_test',
      },
      { parent_id: 'entity_aab_test' },
    );
    await sleep(sleepTime);

    // delete an entity
    const entityToDelete = 'entity_aaa_test';
    await models.entityRelation.delete({ child_id: entityToDelete }); // can't delete entity until entity relation is gone
    await models.entity.delete({ id: entityToDelete });
    await sleep(sleepTime);

    await models.database.waitForAllChangeHandlers();

    expect(hierarchyCacher.buildAndCacheHierarchies).to.have.been.calledOnce;
    EntityHierarchyCacher.prototype.buildAndCacheHierarchies.restore();
  });
});
