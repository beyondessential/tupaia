import { expect } from 'chai';
import { EntityType } from '@tupaia/database';
import { basicDataVillage } from '/apiV1/dataBuilders/generic/orgUnit/basicDataVillage';
import sinon from 'sinon';

const createEntity = parent =>
  sinon.createStubInstance(EntityType, {
    parent,
  });

const assertResultDataIncludeMembers = async ({ parentFacility, members }) => {
  const entity = createEntity(parentFacility);
  const results = await basicDataVillage({ entity });

  expect(results).to.have.property('data');
  expect(results.data).to.deep.include.members(members);
};

describe('basicDataVillage', () => {
  it('should include the expected number of data', async () => {
    const entity = createEntity(null);
    const results = await basicDataVillage({ entity });

    expect(results).to.have.property('data');
    expect(results.data).to.have.property('length', 2);
  });

  it('should specify the village type', async () => {
    await assertResultDataIncludeMembers({
      parentFacility: null,
      members: [{ name: 'Type', value: 'Village/Hamlet' }],
    });
  });

  it('should specify the name of the nearest health facility', async () => {
    const parentFacility = { name: 'Parent facility' };
    await assertResultDataIncludeMembers({
      parentFacility,
      members: [{ name: 'Nearest Health Facility', value: parentFacility.name }],
    });
  });

  it('should show "No data" if the nearest health facility is not defined', async () => {
    await assertResultDataIncludeMembers({
      parentFacility: null,
      members: [{ name: 'Nearest Health Facility', value: 'No data' }],
    });
  });
});
