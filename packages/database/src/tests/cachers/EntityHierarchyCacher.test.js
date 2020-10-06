/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { getTestModels, populateTestData } from '../../testUtilities';
import { EntityHierarchyCacher } from '../../cachers/EntityHierarchyCacher';

import {
  TEST_DATA,
  EXPECTED_INITIAL_ANCESTOR_DESCENDANT_RELATIONS,
} from './EntityHierarchyCacher.fixtures';

describe('EntityHierarchyCacher', () => {
  const models = getTestModels();
  const hierarchyCacher = new EntityHierarchyCacher(models);

  const buildAndCacheProject = async projectCode => {
    const project = await models.project.findOne({ code: projectCode });
    await hierarchyCacher.buildAndCacheProject(project);
  };
  const assertRelationsMatch = async (projectCode, relations) => {
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

  before(async () => {
    await populateTestData(models, TEST_DATA);
  });

  describe('buildAndCacheProject', async () => {
    const assertProjectRelationsCorrectlyBuilt = async projectCode => {
      await buildAndCacheProject(projectCode);
      await assertRelationsMatch(
        projectCode,
        EXPECTED_INITIAL_ANCESTOR_DESCENDANT_RELATIONS[projectCode],
      );
    };
    it('handles a hierarchy that is fully canonical', async () => {
      await assertProjectRelationsCorrectlyBuilt('project_a_test');
    });
    it('handles a hierarchy that has entity relation links', async () => {
      await assertProjectRelationsCorrectlyBuilt('project_b_test');
    });
  });
});
