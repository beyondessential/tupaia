import { expect } from 'chai';

import { ENTITY_TYPES, ORG_UNIT_ENTITY_TYPES } from '../../../database/models/Entity';
import { upsertEntity } from '../../testUtilities';

const { DISASTER, FACILITY } = ENTITY_TYPES;

const upsertOrgUnitEntity = async data => upsertEntity({ ...data, type: FACILITY });

const upsertNonOrgUnitEntity = async data => upsertEntity({ ...data, type: DISASTER });

const assertHaveEqualIds = (expectedObject, actualObject) => {
  expect(actualObject).to.have.property('id', expectedObject.id);
};

describe('EntityModel', () => {
  describe('isOrganisationUnit()', () => {
    Promise.all(
      Object.values(ORG_UNIT_ENTITY_TYPES).map(async type =>
        it(`should return true if its type is ${type}`, async () => {
          const entity = await upsertEntity({ type });
          expect(entity.isOrganisationUnit()).to.be.true;
        }),
      ),
    );

    it('should return false if its type is not an organisation unit type', async () => {
      const entity = await upsertEntity({ type: DISASTER });
      expect(entity.isOrganisationUnit()).to.be.false;
    });
  });

  describe('isTrackedEntity()', () => {
    Promise.all(
      Object.values(ORG_UNIT_ENTITY_TYPES).map(async type =>
        it(`should return false if its type is ${type}`, async () => {
          const entity = await upsertEntity({ type });
          expect(entity.isTrackedEntity()).to.be.false;
        }),
      ),
    );

    it('should return true if its type is not an organisation unit type', async () => {
      const entity = await upsertEntity({ type: DISASTER });
      expect(entity.isTrackedEntity()).to.be.true;
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
