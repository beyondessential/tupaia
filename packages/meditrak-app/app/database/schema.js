/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import * as DataTypes from './types';

export const schema = {
  schema: Object.values(DataTypes),
  schemaVersion: 19,
  migration: (oldRealm, newRealm) => {
    // For anyone upgrading from below version 3, change permission level to permission group
    if (oldRealm.schemaVersion < 3) {
      const oldSurveys = oldRealm.objects('Survey');
      const newSurveys = newRealm.objects('Survey');

      // Set the permission group id according to the old permission level for all surveys
      const permissionGroupIds = [
        '59085f2dfc6a0715dae508e1', // Old 'level 1'
        '59085f2dfc6a0715dae508e2', // Old 'level 2'
        '59085f2dfc6a0715dae508e3', // Old 'level 3'
      ];
      oldSurveys.forEach((oldSurvey, index) => {
        newSurveys[index].permissionGroupId = permissionGroupIds[oldSurvey.permissionLevel - 1];
      });
    }

    // Migrate base64 images in main menu to disk images.
    if (oldRealm.schemaVersion < 5) {
      const oldSurveys = oldRealm.objects('Survey');
      const newSurveys = newRealm.objects('Survey');

      oldSurveys.forEach((oldSurvey, index) => {
        const { imageData } = oldSurvey;
        const fileName = DataTypes.Survey.storeImageData(oldSurvey.id, imageData);

        newSurveys[index].imageName = fileName;
      });
    }

    // Force a full resync if required
    // NB: a full resync is almost never required -- see if you can add a migration to
    // syncMigrations.js before putting something here.
    const versionsRequiringFullResync = [
      6, // Introduced survey groups
      8, // Replaced answersEnablingFollowUp with more complex visibilityCriteria
      9, // Added validation criteria to survey screen components
    ];
    if (oldRealm.schemaVersion < Math.max(versionsRequiringFullResync)) {
      const results = newRealm.objects('Setting').filtered('key = "LATEST_SERVER_SYNC_TIMESTAMP"');
      if (results) newRealm.delete(results);
    }

    // Migrate from permission groups to access policies and country codes.
    if (oldRealm.schemaVersion < 10) {
      const countryCodeMapping = {
        'Demo Land': 'DL',
        'No Country': 'NC',
        Kiribati: 'KI',
        'Solomon Islands': 'SB',
        Tonga: 'TO',
        Vanuatu: 'VU',
        'Timor-Leste': 'TL',
        Tokelau: 'TK',
        Samoa: 'WS',
        'Cook Islands': 'CK',
      };

      const permissionGroupMapping = {
        '59085f2dfc6a0715dae508e1': 'Public',
        '59085f2dfc6a0715dae508e2': 'Donor',
        '59085f2dfc6a0715dae508e3': 'Admin',
        '5a7bda4a3ec0d460d21b8141': 'Royal Australasian College of Surgeons',
      };

      Object.keys(permissionGroupMapping).forEach(permissionGroupId => {
        newRealm.create(
          'PermissionGroup',
          {
            id: permissionGroupId,
            name: permissionGroupMapping[permissionGroupId],
          },
          true,
        );
      });

      const countries = newRealm.objects('Country');

      countries.forEach(country => {
        if (countryCodeMapping[country.name]) {
          // eslint-disable-next-line no-param-reassign
          country.code = countryCodeMapping[country.name];
        }
      });

      // Convert all users current permission groups to an access policy, overridden
      // by first online auth refresh.
      const oldUsers = oldRealm.objects('User').sorted('id');
      const newUsers = newRealm.objects('User').sorted('id');

      const accessPolicyTemplate = {
        permissions: {
          surveys: {
            _access: {
              _default: false,
            },
            _items: {},
          },
        },
      };

      oldUsers.forEach((user, index) => {
        try {
          const permissionGroups = JSON.parse(user.permissionGroups);
          const accessPolicy = { ...accessPolicyTemplate };

          Object.keys(permissionGroups).forEach(countryId => {
            const country = newRealm.objects('Country').filtered(`id="${countryId}"`)[0];
            const permissionGroupNames = permissionGroups[countryId].map(
              permissionGroupId => permissionGroupMapping[permissionGroupId],
            );

            if (permissionGroupNames.length === 0) {
              return;
            }

            const access = {};
            permissionGroupNames.forEach(permissionGroupName => {
              access[permissionGroupName] = true;
            });

            // eslint-disable-next-line no-underscore-dangle
            accessPolicy.permissions.surveys._items[country.code] = { _access: access };

            newUsers[index].accessPolicyData = JSON.stringify(accessPolicy);
          });
        } catch (error) {
          if (error instanceof SyntaxError) {
            newRealm.delete(newUsers[index]);
          }
        }
      });

      // Migrate old surveys to link to permission groups.
      const oldSurveys = oldRealm.objects('Survey').sorted('id');
      const newSurveys = newRealm.objects('Survey').sorted('id');
      oldSurveys
        .filter(oldSurvey => oldSurvey.permissionGroupId)
        .forEach((oldSurvey, index) => {
          const permissionGroups = newRealm
            .objects('PermissionGroup')
            .filtered(`id="${oldSurvey.permissionGroupId}"`);
          if (permissionGroups.length > 0) {
            newSurveys[index].permissionGroup = permissionGroups[0];
          }
        });

      // Migrate country ids to be country references in Areas.
      const oldAreas = oldRealm.objects('Area').sorted('id');
      const newAreas = newRealm.objects('Area').sorted('id');

      oldAreas.forEach((area, index) => {
        if (area.countryId) {
          const newArea = newAreas[index];
          const countries = newRealm.objects('Country').filtered(`id="${area.countryId}"`);
          if (countries.length > 0) {
            newArea.country = countries[0];
          }
        }
      });
    }

    if (oldRealm.schemaVersion < 19) {
      const oldOptions = oldRealm.objects('Option');
      const newOptions = newRealm.objects('Option');

      oldOptions.forEach((oldOption, index) => {
        const optionSets = oldRealm.objects('OptionSet').filtered(`options.id="${oldOption.id}"`);
        if (optionSets.length > 0) {
          const optionSet = optionSets[0];
          newOptions[index].optionSet = optionSet;
        }
      });
    }
  },
};
