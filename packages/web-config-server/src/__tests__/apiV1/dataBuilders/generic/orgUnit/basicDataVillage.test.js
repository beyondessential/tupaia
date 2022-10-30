import { createJestMockInstance } from '@tupaia/utils';
import { basicDataVillage } from '/apiV1/dataBuilders/generic/orgUnit/basicDataVillage';

const createEntity = parents =>
  createJestMockInstance('@tupaia/database', 'EntityType', {
    getParent: async hierarchyId => parents.find(parent => parent?.hierarchy === hierarchyId),
  });

const projects = {
  explore: { entity_hierarchy_id: 'explore_hierarchy' },
  lily: { entity_hierarchy_id: 'lily_hierarchy' },
};
const projectModel = createJestMockInstance('@tupaia/database', 'DatabaseModel', {
  findOne: ({ code: projectCode }) => projects[projectCode],
});

const models = { project: projectModel };

const assertResultDataIncludeMembers = async ({
  parentFacilities,
  members,
  projectCode = 'explore',
}) => {
  const entity = createEntity(parentFacilities);
  const results = await basicDataVillage({ entity, models, query: { projectCode } });
  expect(results).toHaveProperty('data');
  expect(results.data).toIncludeAllMembers(members);
};

describe('basicDataVillage', () => {
  it('should include the expected number of data', async () => {
    const entity = createEntity([null]);
    const results = await basicDataVillage({ entity, models, query: { projectCode: 'explore' } });

    expect(results).toHaveProperty('data');
    expect(results.data).toHaveProperty('length', 2);
  });

  it('should specify the village type', async () => {
    await assertResultDataIncludeMembers({
      parentFacilities: [null],
      members: [{ name: 'Type', value: 'Village/Hamlet' }],
    });
  });

  it('should specify the name of the nearest health facility', async () => {
    const parentFacilities = [{ name: 'Parent facility', hierarchy: 'explore_hierarchy' }];
    await assertResultDataIncludeMembers({
      parentFacilities,
      members: [{ name: 'Nearest Health Facility', value: parentFacilities[0].name }],
    });
  });

  it('should show "No data" if the nearest health facility is not defined', async () => {
    await assertResultDataIncludeMembers({
      parentFacilities: [null],
      members: [{ name: 'Nearest Health Facility', value: 'No data' }],
    });
  });

  it('should specify the name of the nearest health facility for the requested hierarchy', async () => {
    const parentFacilities = [
      { name: 'Explore Parent facility', hierarchy: 'explore_hierarchy' },
      { name: 'Lily Parent facility', hierarchy: 'lily_hierarchy' },
    ];
    await assertResultDataIncludeMembers({
      parentFacilities,
      members: [{ name: 'Nearest Health Facility', value: parentFacilities[0].name }],
    });
    await assertResultDataIncludeMembers({
      parentFacilities,
      members: [{ name: 'Nearest Health Facility', value: parentFacilities[1].name }],
      projectCode: 'lily',
    });
  });
});
