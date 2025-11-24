import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

import { findOrCreateDummyCountryEntity, findOrCreateRecords, generateId } from '@tupaia/database';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData } from '../../testUtilities';

describe('GET entity hierarchy', () => {
  const ALT_PERMISSION_GROUP = 'Alternative';
  const PUBLIC_PERMISSION_GROUP = 'Public';
  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP, ALT_PERMISSION_GROUP],
    TO: [BES_ADMIN_PERMISSION_GROUP, ALT_PERMISSION_GROUP],
  };

  const TUPAIA_ADMIN_POLICY = {
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
    await resetTestData();
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

  after(async () => {
    await resetTestData();
  });

  describe('GET /entityHierarchy/:id', () => {
    it('Successfully fetches single entity hierarchy when is BES Admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[0].id}`);

      expect(result).to.deep.equal({
        ...PROJECT_ENTITY_HIERARCHIES[0],
        canonical_types: ['country'],
      });
    });

    it('Successfully fetches single entity hierarchy when has Tupaia Admin Panel access to the project', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);
      const { body: result } = await app.get(`entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[0].id}`);

      expect(result).to.deep.equal({
        ...PROJECT_ENTITY_HIERARCHIES[0],
        canonical_types: ['country'],
      });
    });

    it('Throws an exception if the user has admin panel access but not access to the project', async () => {
      await app.grantAccess({
        TO: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      });
      const { body: result } = await app.get(`entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[1].id}`);

      expect(result).to.deep.equal({
        error: `One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access to hierarchy with id: '${PROJECT_ENTITY_HIERARCHIES[1].id}'`,
      });
    });

    it('Throws an exception if the user has access to the project but not admin panel access', async () => {
      await app.grantAccess({
        TO: [ALT_PERMISSION_GROUP],
      });
      const { body: result } = await app.get(`entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[1].id}`);

      expect(result).to.deep.equal({
        error: `One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access to hierarchy with id: '${PROJECT_ENTITY_HIERARCHIES[1].id}'`,
      });
    });

    it('Throws an exception if the user has no access to the project or admin panel access', async () => {
      await app.grantAccess({
        TO: [PUBLIC_PERMISSION_GROUP],
      });
      const { body: result } = await app.get(`entityHierarchy/${PROJECT_ENTITY_HIERARCHIES[1].id}`);

      expect(result).to.deep.equal({
        error: `One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access to hierarchy with id: '${PROJECT_ENTITY_HIERARCHIES[1].id}'`,
      });
    });
  });

  describe('GET /entityHierarchy', () => {
    it('Successfully fetches all entity hierarchies when is BES Admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get('entityHierarchy');

      expect(result).to.deep.equal(
        PROJECT_ENTITY_HIERARCHIES.map(entityHierarchy => ({
          ...entityHierarchy,
          canonical_types: ['country'],
        })),
      );
    });

    it('Successfully fetches only the entity hierarchies the user has access to when user has Tupaia Admin Panel permissions', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);
      const { body: result } = await app.get('entityHierarchy');

      expect(result).to.deep.equal([
        {
          ...PROJECT_ENTITY_HIERARCHIES[0],
          canonical_types: ['country'],
        },
      ]);
    });

    it('Throws an exception if the user does not have admin panel or BES admin access', async () => {
      await app.grantAccess({
        TO: [PUBLIC_PERMISSION_GROUP],
      });
      const { body: result } = await app.get('entityHierarchy');

      expect(result).to.deep.equal({
        error:
          'One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access',
      });
    });
  });
});
