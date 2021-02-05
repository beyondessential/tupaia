/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../TestableApp';
import { prepareStubAndAuthenticate } from '../utilities/prepareStubAndAuthenticate';

describe('Permissions checker for EditAccessRequests', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
    TO: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let vanuatuPublicRequest;
  let laosPublicRequest;
  let kiribatiBESRequest;
  let laosEntityId;
  let besPermissionGroupId;

  before(async () => {
    const { entity: vanuatuEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
    });
    const { entity: kiribatiEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
    });
    const { entity: laosEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
    });
    laosEntityId = laosEntity.id;

    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });
    const besPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: BES_ADMIN_PERMISSION_GROUP,
    });
    besPermissionGroupId = besPermissionGroup.id;

    vanuatuPublicRequest = await findOrCreateDummyRecord(models.accessRequest, {
      entity_id: vanuatuEntity.id,
      permission_group_id: publicPermissionGroup.id,
      approved: null,
      processed_by: null,
    });
    laosPublicRequest = await findOrCreateDummyRecord(models.accessRequest, {
      entity_id: laosEntity.id,
      permission_group_id: publicPermissionGroup.id,
      approved: null,
      processed_by: null,
    });
    kiribatiBESRequest = await findOrCreateDummyRecord(models.accessRequest, {
      entity_id: kiribatiEntity.id,
      permission_group_id: besPermissionGroup.id,
      approved: null,
      processed_by: null,
    });
  });

  afterEach(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('PUT /accessRequests/:id', async () => {
    describe('Insufficient permissions', async () => {
      it('Throw a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
        const policy = {
          DL: ['Public'],
        };
        await prepareStubAndAuthenticate(app, policy);
        const { body: result } = await app.put(`accessRequests/${vanuatuPublicRequest.id}`, {
          body: { approved: true },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception if we do not have admin panel access to the entity of the access request are editing', async () => {
        await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
        const { body: result } = await app.put(`accessRequests/${laosPublicRequest.id}`, {
          body: { approved: true },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to edit an access request to point to an entity we lack permission for', async () => {
        await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
        const { body: result } = await app.put(`accessRequests/${vanuatuPublicRequest.id}`, {
          body: {
            approved: true,
            entity_id: laosEntityId,
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to approve a BES Admin request as a non BES Admin user', async () => {
        await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
        const { body: result } = await app.put(`accessRequests/${kiribatiBESRequest.id}`, {
          body: {
            approved: true,
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to edit an access request to point to BES Admin permission group', async () => {
        await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
        const { body: result } = await app.put(`accessRequests/${vanuatuPublicRequest.id}`, {
          body: {
            approved: true,
            permission_group_id: besPermissionGroupId,
          },
        });

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permissions', async () => {
      it('Edit an access request if we have admin panel access to the entity the request is for', async () => {
        await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
        await app.put(`accessRequests/${vanuatuPublicRequest.id}`, {
          body: { approved: true },
        });
        const result = await models.accessRequest.findById(vanuatuPublicRequest.id);

        expect(result.approved).to.true;
      });

      it('Edit any access request as BES Admin', async () => {
        await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
        await app.put(`accessRequests/${kiribatiBESRequest.id}`, {
          body: { approved: true },
        });
        const result = await models.accessRequest.findById(kiribatiBESRequest.id);

        expect(result.approved).to.true;
      });
    });

    describe('Restricted actions', async () => {
      it('Throw an exception when editing an access request that has already been processed', async () => {
        // Exactly the same as the sufficient permissions check
        // Most of the time, this is still approved from the previous check
        // But redoing it here allows this unit test to run in isolation
        await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
        await app.put(`accessRequests/${vanuatuPublicRequest.id}`, {
          body: { approved: true },
        });
        // Attempt to approve a second time, this time it should fail
        const { body: result } = await app.put(`accessRequests/${vanuatuPublicRequest.id}`, {
          body: { approved: true },
        });

        expect(result).to.have.keys('error');
      });
    });
  });
});
