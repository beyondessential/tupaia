import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyCountryEntity, findOrCreateRecords, generateId } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Editing an entity hierarchy', async () => {
  const ALT_PERMISSION_GROUP = 'Alternative';
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP, ALT_PERMISSION_GROUP],
    TO: [BES_ADMIN_PERMISSION_GROUP, ALT_PERMISSION_GROUP],
  };

  const TUPAIA_ADMIN_POLICY = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, ALT_PERMISSION_GROUP],
    TO: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, ALT_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;

  const PROJECT_ENTITIES = [
    {
      code: 'test_project_1',
      id: generateId(),
    },
    {
      code: 'test_project_2',
      id: generateId(),
    },
  ];

  const PROJECT_ENTITY_HIERARCHIES = PROJECT_ENTITIES.map(entity => ({
    id: generateId(),
    name: entity.code,
    canonical_types: '{country}',
  }));

  const PROJECTS = PROJECT_ENTITY_HIERARCHIES.map((entityHierarchy, i) => ({
    id: generateId(),
    entity_hierarchy_id: entityHierarchy.id,
    code: PROJECT_ENTITIES[i].code,
    entity_id: PROJECT_ENTITIES[i].id,
    permission_groups: `{${ALT_PERMISSION_GROUP}}`,
  }));

  before(async () => {
    const TO = await findOrCreateDummyCountryEntity(models, { code: 'TO' });
    const DL = await findOrCreateDummyCountryEntity(models, { code: 'DL' });

    const ENTITY_RELATIONS = PROJECT_ENTITIES.map((entity, i) => ({
      parent_id: entity.id,
      child_id: i === 0 ? TO.entity.id : DL.entity.id,
      entity_hierarchy_id: PROJECT_ENTITY_HIERARCHIES[i].id,
    }));

    await findOrCreateRecords(models, {
      entity: PROJECT_ENTITIES,
      entityHierarchy: PROJECT_ENTITY_HIERARCHIES,
      project: PROJECTS,
      entityRelation: ENTITY_RELATIONS,
    });
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('PUT /entityHierarchy/:id', async () => {
    it('Successfully changes the entity hierarchy when is BES Admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[0].id}`, {
        body: { canonical_types: ['country', 'district'] },
      });

      const result = await models.entityHierarchy.find({ id: PROJECT_ENTITY_HIERARCHIES[0].id });
      expect(result.length).to.equal(1);
      expect(result[0].canonical_types).to.deep.equal(['country', 'district']);
    });

    it('Successfully changes the entity hierarchy when is Admin Panel user and has access to the project', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);
      await app.put(`entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[0].id}`, {
        body: { canonical_types: ['country'] },
      });

      const result = await models.entityHierarchy.find({ id: PROJECT_ENTITY_HIERARCHIES[0].id });
      expect(result.length).to.equal(1);
      expect(result[0].canonical_types).to.deep.equal(['country']);
    });

    it('Throws an exception if the user has admin panel access but not access to the project', async () => {
      await app.grantAccess({
        TO: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      });
      const { body: result } = await app.put(
        `entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[1].id}`,
        {
          body: { canonical_types: ['country', 'district'] },
        },
      );

      expect(result).to.deep.equal({
        error: `One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access to project with hierarchy id: '${PROJECT_ENTITY_HIERARCHIES[1].id}'`,
      });
    });

    it('Throws an exception if the user has access to the project but not admin panel access', async () => {
      await app.grantAccess({
        TO: [ALT_PERMISSION_GROUP],
      });
      const { body: result } = await app.put(
        `entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[1].id}`,
        {
          body: { canonical_types: ['country', 'district'] },
        },
      );

      expect(result).to.deep.equal({
        error: `One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access to project with hierarchy id: '${PROJECT_ENTITY_HIERARCHIES[1].id}'`,
      });
    });

    it('Throws an exception if the user has no access to the project or admin panel access', async () => {
      await app.grantAccess({
        TO: ['Public'],
      });
      const { body: result } = await app.put(
        `entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[1].id}`,
        {
          body: { canonical_types: ['country', 'district'] },
        },
      );

      expect(result).to.deep.equal({
        error: `One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access to project with hierarchy id: '${PROJECT_ENTITY_HIERARCHIES[1].id}'`,
      });
    });
  });
});
