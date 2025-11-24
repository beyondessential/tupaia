import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

import { findOrCreateDummyRecord } from '@tupaia/database';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('GET entity relations', () => {
  const FIJI_POLICY = {
    FJ: ['Fiji Admin'],
  };
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let exploreHierarchy;
  let exploreToFiji;
  let fijiToDistrict;
  let kiribatiToDistrict;

  const findOrCreateEntitiesAndRelations = async ({ parent, child, entityHierarchyId }) => {
    const parentEntity = await findOrCreateDummyRecord(models.entity, parent);
    const childEntity = await findOrCreateDummyRecord(models.entity, child);
    const entityRelation = await findOrCreateDummyRecord(models.entityRelation, {
      parent_id: parentEntity.id,
      child_id: childEntity.id,
      entity_hierarchy_id: entityHierarchyId,
    });

    return {
      parent: parentEntity,
      child: childEntity,
      relation: entityRelation,
    };
  };

  before(async () => {
    exploreHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, {
      name: 'explore',
    });

    exploreToFiji = await findOrCreateEntitiesAndRelations({
      parent: { code: 'explore', country_code: null, type: 'project' },
      child: { code: 'FJ', country_code: 'FJ', type: 'country' },
      entityHierarchyId: exploreHierarchy.id,
    });
    fijiToDistrict = await findOrCreateEntitiesAndRelations({
      parent: { code: 'FJ', country_code: 'FJ', type: 'country' },
      child: { code: 'FJ_Eastern', country_code: 'FJ', type: 'district' },
      entityHierarchyId: exploreHierarchy.id,
    });
    kiribatiToDistrict = await findOrCreateEntitiesAndRelations({
      parent: { code: 'KI', country_code: 'KI', type: 'country' },
      child: { code: 'KI_Phoenix Islands', country_code: 'KI', type: 'district' },
      entityHierarchyId: exploreHierarchy.id,
    });
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /entityRelations/:id', () => {
    it('Returns a record if relation id exists and user has permissions: hierarchy -> country relation', async () => {
      await app.grantAccess(FIJI_POLICY);
      const { body: result } = await app.get(`entityRelations/${exploreToFiji.relation.id}`);

      const expected = {
        id: exploreToFiji.relation.id,
        parent_id: exploreToFiji.parent.id,
        child_id: exploreToFiji.child.id,
        entity_hierarchy_id: exploreHierarchy.id,
      };
      expect(result).to.deep.equal(expected);
    });

    it('Returns a record if relation id exists and user has permissions: country -> sub-country relation', async () => {
      await app.grantAccess(FIJI_POLICY);
      const { body: result } = await app.get(`entityRelations/${fijiToDistrict.relation.id}`);

      const expected = {
        id: fijiToDistrict.relation.id,
        parent_id: fijiToDistrict.parent.id,
        child_id: fijiToDistrict.child.id,
        entity_hierarchy_id: exploreHierarchy.id,
      };
      expect(result).to.deep.equal(expected);
    });

    it('Always returns a record for a BES Admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`entityRelations/${fijiToDistrict.relation.id}`);

      const expected = {
        id: fijiToDistrict.relation.id,
        parent_id: fijiToDistrict.parent.id,
        child_id: fijiToDistrict.child.id,
        entity_hierarchy_id: exploreHierarchy.id,
      };
      expect(result).to.deep.equal(expected);
    });

    it('Returns an error if resource id is invalid', async () => {
      await app.grantAccess(FIJI_POLICY);
      const { body: result } = await app.get(`entityRelations/invalid`);

      expect(result.error).to.include('No entity relation exists');
    });

    it('Returns an error if user does not have access to a country child entity', async () => {
      const policy = {
        KI: ['Kiribati Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`entityRelations/${exploreToFiji.relation.id}`);

      expect(result.error).to.include('You do not have permissions for this entity relation');
    });

    it('Returns an error if user does not have access to a sub-country child entity', async () => {
      const policy = {
        KI: ['Kiribati Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`entityRelations/${fijiToDistrict.relation.id}`);

      expect(result.error).to.include('You do not have permissions for this entity relation');
    });
  });

  describe('GET /entityRelations', () => {
    it('Returns the relations the users has permissions to', async () => {
      await app.grantAccess(FIJI_POLICY);
      const { body: result } = await app.get('entityRelations');

      const expected = [
        {
          id: fijiToDistrict.relation.id,
          parent_id: fijiToDistrict.parent.id,
          child_id: fijiToDistrict.child.id,
          entity_hierarchy_id: exploreHierarchy.id,
        },
        {
          id: exploreToFiji.relation.id,
          parent_id: exploreToFiji.parent.id,
          child_id: exploreToFiji.child.id,
          entity_hierarchy_id: exploreHierarchy.id,
        },
      ];
      expect(result).to.deep.equalInAnyOrder(expected);
    });

    it('Returns an empty list if user has no permissions to the requested relations', async () => {
      await app.grantAccess({
        DL: ['Public'],
      });
      const { body: result } = await app.get('entityRelations');

      expect(result).to.deep.equal([]);
    });

    it('Supports custom filters', async () => {
      await app.grantAccess({
        FJ: ['Fiji Admin'],
        KI: ['Kiribati Admin'],
      });
      const filterString = `filter={"child_id":{"comparator":"in","comparisonValue":["${[
        fijiToDistrict.child.id,
        kiribatiToDistrict.child.id,
      ].join('","')}"]}}`;
      const { body: result } = await app.get(`entityRelations?${filterString}`);

      const expected = [
        {
          id: fijiToDistrict.relation.id,
          parent_id: fijiToDistrict.parent.id,
          child_id: fijiToDistrict.child.id,
          entity_hierarchy_id: exploreHierarchy.id,
        },
        {
          id: kiribatiToDistrict.relation.id,
          parent_id: kiribatiToDistrict.parent.id,
          child_id: kiribatiToDistrict.child.id,
          entity_hierarchy_id: exploreHierarchy.id,
        },
      ];
      expect(result).to.deep.equalInAnyOrder(expected);
    });
  });
});
