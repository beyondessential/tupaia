/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import { models } from '../migrate';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async db => {
  const dhisApi = new DhisApi();
  const allFacilities = await models.facility.all();
  try {
    // Use for-await to avoid placing hard load on dhis server.
    for (let i = 0; i < allFacilities.length; i++) {
      const facility = allFacilities[i];
      const geographicalAncestors = await models.geographicalArea.getAncestorsPath(
        facility.geographical_area_id,
      );
      const shouldProceed =
        geographicalAncestors &&
        geographicalAncestors.filter(
          geographicalAncestor => !geographicalAncestor.organisation_unit_code,
        ).length > 0;
      if (!shouldProceed) {
        console.warn(
          `Skipping facility '${facility.name}', all ancestors already have organisation unit codes.`,
        );
        continue;
      }

      const dhisResult = await dhisApi.fetch(
        `organisationUnits?fields=name,code,ancestors[name, code]&filter=code:eq:${facility.code}`,
      );

      const { organisationUnits } = dhisResult;

      if (!organisationUnits || organisationUnits.length === 0) {
        console.warn(`Could not find matching DHIS entry for ${facility.name}(${facility.code})`);
        continue;
      } else if (organisationUnits.length > 1) {
        console.warn(`More than one DHIS entry for ${facility.name}(${facility.code})`);
        continue;
      }

      // Create a name:code map for DHIS org units in the tree.
      const { ancestors } = organisationUnits[0];
      const dhisAncestorCodeDictionary = {};
      ancestors.forEach(({ name, code }) => {
        dhisAncestorCodeDictionary[name] = code;
      });

      // Source codes of geographical areas by matching the DHIS ancestor names to the ancestors of geographical areas.
      for (let a = 0; a < geographicalAncestors.length; a++) {
        const geographicalArea = geographicalAncestors[a];
        const matchingDhisAncestorCode = dhisAncestorCodeDictionary[geographicalArea.name];

        if (!matchingDhisAncestorCode) {
          console.warn(
            `No DHIS match for geographical area with name '${geographicalArea.name}' in ancestor tree.`,
          );
          continue;
        }

        if (geographicalArea.organisation_unit_code === matchingDhisAncestorCode) {
          // Skip if the entry in the database is already correct.
          console.info(`Skipped '${matchingDhisAncestorCode}', already in database.`);
          continue;
        }

        geographicalArea.organisation_unit_code = matchingDhisAncestorCode;
        await geographicalArea.save();
        console.info(`Updated '${geographicalArea.name}' with code '${matchingDhisAncestorCode}'.`);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
