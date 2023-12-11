/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for CreateDashboards', () => {
  const SUFFICIENT_TUPAIA_ADMIN_PANEL_PERMISSION_GROUP_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const INSUFFICIENT_POLICY = {
    DL: ['Public'],
    KI: ['Admin'],
  };

  const SUFFICIENT_BES_ADMIN_POLICY = {
    KI: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;

  afterEach(() => {
    app.revokeAccess();
  });

  describe('POST /mapOverlayGroups', () => {
    describe('Insufficient permission', () => {
      it('Throw a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
        await app.grantAccess(INSUFFICIENT_POLICY);
        const { body: result } = await app.post(`mapOverlayGroups`, {
          body: {
            name: 'No access anywhere',
            code: 'no_access_anywhere',
          },
        });

        expect(result).toHaveProperty('error');
      });

      describe('Sufficient permission', () => {
        it('Allow creation of a mapOverlayGroups if we have BES admin permission', async () => {
          await app.grantAccess(SUFFICIENT_BES_ADMIN_POLICY);
          const code = 'sufficient_permissions';
          const name = 'Sufficient Permissions';
          await app.post(`mapOverlayGroups`, {
            body: {
              name,
              code,
            },
          });
          const result = await models.mapOverlayGroup.find({
            code,
          });

          expect(result.length).toBe(1);
          expect(result[0].name).toBe(name);
        });

        it('Allow creation of a mapOverlayGroups if we have Tupaia Admin panel permission', async () => {
          await app.grantAccess(SUFFICIENT_TUPAIA_ADMIN_PANEL_PERMISSION_GROUP_POLICY);
          const code = 'tupaia_admin_panel_permission_group_user';
          const name = 'Tupaia Admin Panel Permission Group User';
          await app.post(`mapOverlayGroups`, {
            body: {
              name,
              code,
            },
          });
          const result = await models.mapOverlayGroup.find({
            code,
          });

          expect(result.length).toBe(1);
          expect(result[0].name).toBe(name);
        });
      });

      describe('Invalid input', () => {
        it('Throw a input validation error if we do not have code', async () => {
          await app.grantAccess(SUFFICIENT_BES_ADMIN_POLICY);
          const { body: result } = await app.post(`mapOverlayGroups`, {
            body: {
              name: 'No code',
            },
          });

          expect(result).toHaveProperty('error');
        });

        it('Throw a input validation error if we do not have name', async () => {
          await app.grantAccess(SUFFICIENT_BES_ADMIN_POLICY);
          const { body: result } = await app.post(`mapOverlayGroups`, {
            body: {
              code: 'no_name',
            },
          });

          expect(result).toHaveProperty('error');
        });

        it('Throw a input validation error if mapOverlayGroups with the same code already exists', async () => {
          await app.grantAccess(SUFFICIENT_BES_ADMIN_POLICY);
          const code = 'same_code_twice';
          const firstName = 'First';
          await app.post(`mapOverlayGroups`, {
            body: {
              name: firstName,
              code,
            },
          });
          const result = await models.mapOverlayGroup.find({
            code,
          });

          expect(result.length).toBe(1);
          expect(result[0].name).toBe(firstName);

          const { body: secondResult } = await app.post(`mapOverlayGroups`, {
            body: {
              name: 'Second',
              code,
            },
          });

          expect(secondResult).toHaveProperty('error');
        });
      });
    });
  });
});
