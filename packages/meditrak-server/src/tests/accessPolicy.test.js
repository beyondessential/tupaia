/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { TestableApp, getAuthorizationHeader } from './TestableApp';
import { randomEmail } from './testUtilities';

describe('Access Policy', () => {
  const app = new TestableApp();
  const models = app.models;

  const dummyFields = {
    firstName: 'Automated test',
    lastName: 'User',
    password: 'password',
    passwordConfirm: 'password',
    contactNumber: 900000000,
    employer: 'Test',
    position: 'Robot',
    deviceName: 'foobar',
    verifiedEmail: 'verified',
  };

  const headers = { authorization: getAuthorizationHeader() };

  describe('Demo Land public user', () => {
    const emailAddress = randomEmail();
    let authResponsePermissions;
    let userId;

    it('should create basic test user', async () => {
      const userResponse = await app.post('user', {
        headers,
        body: {
          emailAddress,
          ...dummyFields,
        },
      });
      userId = userResponse.body.userId;

      const authResponse = await app.post('auth', {
        headers,
        body: {
          emailAddress,
          password: dummyFields.password,
          deviceName: dummyFields.deviceName,
        },
      });

      authResponsePermissions = authResponse.body.user.accessPolicy.permissions;
    });

    it('should only have surveying access to demo land', () => {
      const { surveys } = authResponsePermissions;

      const surveyPermissionItems = surveys._items;
      expect(surveyPermissionItems.DL._access.Public).to.equal(
        true,
        'Public survey permission found for Demo Land',
      );
      expect(Object.values(surveyPermissionItems).length).to.equal(
        1,
        'Only 1 survey permission found',
      );
    });

    it('should only have reporting access to demo land', () => {
      const { reports } = authResponsePermissions;

      const reportPermissionItems = reports._items;
      expect(reportPermissionItems.DL._access.Public).to.equal(
        true,
        'Public reporting permission found for Demo Land',
      );
      expect(Object.values(reportPermissionItems).length).to.equal(
        1,
        'Only 1 report permission found',
      );
    });

    it('should have only Demo Land UserCountryPermission model in database', async () => {
      const userCountryPermissions = await models.userCountryPermission.find({ user_id: userId });
      expect(userCountryPermissions.length).to.equal(
        1,
        'Only 1 UserCountryPermission added to the database',
      );

      expect(userCountryPermissions[0].country_code).to.equal('DL', 'Country code is Demo Land');
    });
  });

  describe('Tonga admin user', () => {
    const emailAddress = randomEmail();
    let authResponsePermissions;
    let userId;

    it('should create admin test user', async () => {
      const userResponse = await app.post('user', {
        headers,
        body: {
          emailAddress,
          ...dummyFields,
        },
      });
      userId = userResponse.body.userId;

      const adminPermissionGroup = await models.permissionGroup.findOne({
        name: 'Admin',
      });

      // if there's a pre-existing Tonga in the DB, use that, otherwise create
      // one with a test ID so it'll get cleaned up later
      const tongaCountry = await models.country.findOrCreate(
        {
          code: 'TO',
        },
        {
          id: 'tonga_0000000000000_test',
          name: 'Tonga',
        },
      );

      await models.userCountryPermission.create({
        user_id: userId,
        country_id: tongaCountry.id,
        permission_group_id: adminPermissionGroup.id,
      });

      const authResponse = await app.post('auth', {
        headers,
        body: {
          emailAddress,
          password: dummyFields.password,
          deviceName: dummyFields.deviceName,
        },
      });

      authResponsePermissions = authResponse.body.user.accessPolicy.permissions;
    });

    it('should have Demo Land public access', () => {
      const { surveys, reports } = authResponsePermissions;

      const surveyPermissionItems = surveys._items;
      expect(surveyPermissionItems.DL._access.Public).to.equal(
        true,
        'No survey public permission found for Demo Land',
      );
      expect(surveyPermissionItems.DL._access.Admin).to.equal(
        undefined,
        'No survey admin permission found for Demo Land',
      );

      const reportPermissionItems = reports._items;
      expect(reportPermissionItems.DL._access.Public).to.equal(
        true,
        'Public report permission found for Demo Land',
      );
      expect(reportPermissionItems.DL._access.Admin).to.equal(
        undefined,
        'No report admin permission found for Demo Land',
      );
    });

    it('should have Tonga admin and public survey and report access', () => {
      const { surveys, reports } = authResponsePermissions;

      const surveyPermissionItems = surveys._items;
      expect(surveyPermissionItems.TO._access.Public).to.equal(
        true,
        'Public Tonga survey access found',
      );
      expect(surveyPermissionItems.TO._access.Admin).to.equal(
        true,
        'Admin Tonga survey access found',
      );
      expect(Object.values(surveyPermissionItems).length).to.equal(
        2,
        'No other country permissions found in survey group',
      );

      const reportPermissionItems = reports._items;
      expect(reportPermissionItems.TO._access.Public).to.equal(
        true,
        'Public Tonga report access found',
      );
      expect(reportPermissionItems.TO._access.Admin).to.equal(
        true,
        'Admin Tonga report access found',
      );
    });

    it('should not have any report permissions for all other countries', () => {
      const { reports } = authResponsePermissions;

      const reportPermissionItems = reports._items;

      Object.keys(reportPermissionItems).forEach(countryCode => {
        if (countryCode === 'TO' || countryCode === 'DL') {
          return;
        }

        const reportPermission = reportPermissionItems[countryCode];

        expect(reportPermission).to.equal(
          undefined,
          `Country ${countryCode} should have no access to reporting`,
        );
      });
    });

    it('should have only Demo Land and Tonga UserCountryPermission model in database', async () => {
      const userCountryPermissions = await models.userCountryPermission.find({ user_id: userId });
      expect(userCountryPermissions.length).to.equal(
        2,
        'Only 2 UserCountryPermission added to the database',
      );

      userCountryPermissions.forEach(userCountryPermission => {
        expect(userCountryPermission.country_code).to.be.oneOf(
          ['DL', 'TO'],
          `Country ${userCountryPermission.country_code} permission is in the database`,
        );
      });
    });
  });
  describe('Mount Sinai Canada admin user', () => {
    const emailAddress = randomEmail();
    let authResponsePermissions;
    let userId;

    it('should create admin test user', async () => {
      const userResponse = await app.post('user', {
        headers,
        body: {
          emailAddress,
          ...dummyFields,
        },
      });
      userId = userResponse.body.userId;

      const adminPermissionGroup = await models.permissionGroup.findOne({
        name: 'Admin',
      });

      // Create a facility nested deep within a new country other than Demoland.
      const canada = await models.country.updateOrCreate(
        {
          id: 'canada_000000000000_test',
        },
        {
          code: 'CA',
          name: 'Canada',
        },
      );

      const ontario = await models.geographicalArea.create({
        name: 'Ontario',
        code: 'CA_OT',
        level_code: 'district',
        level_name: 'District',
        country_id: canada.id,
      });
      const toronto = await models.geographicalArea.create({
        name: 'Toronto',
        code: 'CA_OT_TO',
        level_code: 'sub_district',
        level_name: 'Sub District',
        country_id: canada.id,
        parent_id: ontario.id,
      });

      const mountSinaiFacility = await models.facility.updateOrCreate(
        {
          code: 'CA_OT_TO_MS',
        },
        {
          code: 'CA_OT_TO_MS',
          name: 'Mount Sinaia Hospital',
          country_id: canada.id,
          geographical_area_id: toronto.id,
          type: 1,
        },
      );

      await models.userFacilityPermission.create({
        user_id: userId,
        clinic_id: mountSinaiFacility.id,
        permission_group_id: adminPermissionGroup.id,
      });

      // Create an admin permission for a region not containing Mount Sinai to test
      // for clashes between facility level permissions and org unit level permissions.
      const ottawaGeographicalArea = await models.geographicalArea.create({
        name: 'Ottawa',
        code: 'CA_OT_OT',
        level_code: 'sub_district',
        level_name: 'Sub District',
        country_id: canada.id,
        parent_id: ontario.id,
      });

      await models.userGeographicalAreaPermission.create({
        user_id: userId,
        geographical_area_id: ottawaGeographicalArea.id,
        permission_group_id: adminPermissionGroup.id,
      });

      const authResponse = await app.post('auth', {
        headers,
        body: {
          emailAddress,
          password: dummyFields.password,
          deviceName: dummyFields.deviceName,
        },
      });

      authResponsePermissions = authResponse.body.user.accessPolicy.permissions;
    });

    it('should have Mount Sinai admin permissions', async () => {
      const { surveys, reports } = authResponsePermissions;

      const permissionTypes = ['Admin', 'Donor', 'Public'];

      const facilitySurveysPermissions =
        surveys._items.CA._items.CA_OT._items.CA_OT_TO._items.CA_OT_TO_MS._access;
      permissionTypes.forEach(permissionType => {
        expect(facilitySurveysPermissions[permissionType]).to.equal(
          true,
          `${permissionType} survey permission found on facility`,
        );
      });

      const facilityReportsPermissions =
        reports._items.CA._items.CA_OT._items.CA_OT_TO._items.CA_OT_TO_MS._access;
      permissionTypes.forEach(permissionType => {
        expect(facilityReportsPermissions[permissionType]).to.equal(
          true,
          `${permissionType} report permission found on facility`,
        );
      });
    });

    it('should have Ottawa admin permissions', async () => {
      const { surveys, reports } = authResponsePermissions;

      const permissionTypes = ['Admin', 'Donor', 'Public'];

      const facilitySurveysPermissions =
        surveys._items.CA._items.CA_OT._items.CA_OT_TO._items.CA_OT_TO_MS._access;
      permissionTypes.forEach(permissionType => {
        expect(facilitySurveysPermissions[permissionType]).to.equal(
          true,
          `${permissionType} survey permission found on facility`,
        );
      });

      const facilityReportsPermissions =
        reports._items.CA._items.CA_OT._items.CA_OT_TO._items.CA_OT_TO_MS._access;
      permissionTypes.forEach(permissionType => {
        expect(facilityReportsPermissions[permissionType]).to.equal(
          true,
          `${permissionType} report permission found on facility`,
        );
      });
    });

    it('should not have Toronto admin permissions', async () => {
      const { surveys, reports } = authResponsePermissions;

      expect(surveys._items.CA._items.CA_OT._items.CA_OT_TO).to.not.have.property('_access');
      expect(reports._items.CA._items.CA_OT._items.CA_OT_TO).to.not.have.property('_access');
    });

    it('should have no report access in Canada', async () => {
      const { reports } = authResponsePermissions;

      expect(reports._items.CA._access).to.equal(
        undefined,
        'Public report permissions found for Canada',
      );
    });
  });
});
