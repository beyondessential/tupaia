'use strict';

import { generateId } from '../utilities/generateId';
import { newDistricts } from './20200130050502-ReconcileClinicEntities/districts';
import { newCountries } from './20200130050502-ReconcileClinicEntities/countries';
import districtGeography from './20200130050502-ReconcileClinicEntities/districtGeog.json';
var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function up(db) {
  try {
    /*
    Remove the triggers so dhis_sync_queue don't get clogged
  */
    await db.runSql(`
      DROP TRIGGER IF EXISTS dhis_sync_queue_trigger ON dhis_sync_queue;
      DROP TRIGGER IF EXISTS meditrak_sync_queue_trigger ON meditrak_sync_queue;
    `);
    const getDistrictGeo = async code => {
      const district = districtGeography.find(x => x.code === code);
      if (!district) return null;
      return district.region;
    };

    /*
    Add the missing countries
  */
    const entities = await db.runSql(`
      SELECT id FROM entity WHERE type = 'world';
    `);
    const [world = {}] = entities.rows;
    let worldId = world.id;
    if (!worldId) {
      worldId = generateId();
      await db.runSql(`INSERT INTO "public"."entity"(
        "id",
        "code",
        "name"
      ) VALUES
      (
        E'${worldId}',
        E'Wo',
        E'World');`);
    }

    const newCountryMap = async country => {
      return `INSERT INTO "public"."entity"(
        "id",
        "code",
        "parent_id",
        "name",
        "type",
        "point",
        "region",
        "image_url",
        "country_code",
        "bounds",
        "metadata"
      )
        VALUES
      (
        E'${country.id}',
        E'${country.code}',
        E'${worldId}',
        E'${country.name}',
        E'country',
        NULL,
        NULL,
        NULL,
        E'${country.code}',
        NULL,
        NULL
      );
      `;
    };
    await Promise.all(newCountries.map(async country => db.runSql(await newCountryMap(country))));

    const newDistrictMap = async district => {
      const { code } = district;
      let parentCode;
      let parentId;
      const hierarchyBreadCrumbs = code.split('_');
      const getParentId = async (parentCode, newEntities) => {
        const parentEntity = newEntities.find(entity => entity.code === parentCode);
        if (parentEntity) return parentEntity.id;
        const parentResults = await db.runSql(`
          SELECT id FROM entity WHERE code = '${parentCode}'`);
        if (parentResults.rows.length > 0) {
          return parentResults.rows[0].id;
        }

        const countryCode = newEntities[0].countryCode || parentCode.split('_')[0];
        // just default to country Id
        const countryResults = await db.runSql(`
        SELECT id FROM entity WHERE code = '${countryCode}'`);
        const firstCountryResult = countryResults.rows[0] || {};
        parentId = firstCountryResult.id || worldId;

        return parentId;
      };
      if (hierarchyBreadCrumbs.length === 2) {
        parentCode = hierarchyBreadCrumbs[0];
        parentId = await getParentId(parentCode, newCountries);
      } else {
        parentCode = `${hierarchyBreadCrumbs[0]}_${hierarchyBreadCrumbs[1]}`;
        parentId = await getParentId(parentCode, newDistricts);
      }
      const region = getDistrictGeo(district.code);
      return `
      INSERT INTO "public"."entity"(
        "id",
        "code",
        "parent_id",
        "name",
        "type",
        "point",
        "region",
        "image_url",
        "country_code",
        "bounds",
        "metadata"
      )
        VALUES
      (
        E'${district.id}',
        E'${district.code}',
        E'${parentId}',
        E'${district.name}',
        E'region',
        NULL,
        ${geometry ? `ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')` : 'NULL'},
        NULL,
        E'${district.countryCode}',
        ${
          geometry
            ? `ST_Envelope(ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')::geometry)`
            : 'NULL'
        },
        NULL
      );
      `;
    };

    for (let x = 0; x < newDistricts.length; x++) {
      const district = newDistricts[x];
      const newDistrictText = await newDistrictMap(district);
      await db.runSql(newDistrictText);
    }

    /*
      Now add the missing clinics
    */

    const missingClinicsQuery = await db.runSql(`
      SELECT ga.name AS parent_name, clinic.code AS code, clinic.name AS name
        FROM clinic LEFT JOIN geographical_area AS ga ON clinic.geographical_area_id = ga.id
        LEFT JOIN entity ON clinic.code = entity.code
      WHERE entity.code IS NULL
    `);

    const missingClinics = missingClinicsQuery.rows;

    const newClinic = async clinic => {
      const { code, parent_name } = clinic;
      const hierarchyBreadCrumbs = code.split('_');
      const countryCode = hierarchyBreadCrumbs[0];
      let parentId;
      if (parent_name) {
        parentId = (newDistricts.find(dist => dist.name === parent_name) || {}).id;
      } else {
        parentId = (
          newCountries.find(({ code: newCountryCode }) => newCountryCode === countryCode) || {}
        ).id;
      }
      if (!parentId) {
        parentId = (
          await db.runSql(`
          SELECT id FROM entity WHERE code = '${countryCode}'`)
        ).rows[0].id;
      }
      const dhis2Data = await getDHIS2Data(clinic.code);
      const { photoUrl, geometry } = dhis2Data || { photoUrl: null, geometry: null };
      const returnValue = `
        INSERT INTO "public"."entity"(
            "id",
            "code",
            "parent_id",
            "name",
            "type",
            "point",
            "region",
            "image_url",
            "country_code",
            "bounds",
            "metadata"
          )
            VALUES
          (
            E'${generateId()}',
            E'${clinic.code}',
            E'${parentId}',
            E'${clinic.name.replace("'", "\\'")}',
            E'facility',
            ${geometry ? `ST_GeomFromGeoJSON('${JSON.stringify(geometry)}')` : 'NULL'},
            NULL,
            ${photoUrl ? `E'${photoUrl}'` : 'NULL'},
            E'${countryCode}',
            NULL,
            NULL
          );
      `;
      return returnValue;
    };
    for (let x = 0; x < missingClinics.length; x++) {
      const clinic = missingClinics[x];
      const newClinicText = await newClinic(clinic);
      await db.runSql(newClinicText);
    }
    /*
    Now update the survey responses missing entities
    The join required for the update to view - just for reference is:
    SELECT
      CAST(data AS json) ->> 'orgUnit' AS organisation_unit_code,
      sr.*,
      e.id AS newEnityId
      FROM dhis_sync_log AS dsl
      INNER JOIN survey_response AS sr ON sr.id = dsl.record_id
      INNER JOIN entity AS e ON e.code = CAST(data AS json) ->> 'orgUnit' AS organisation_unit_code
        WHERE sr.entity_id IS NULL;
  */
    await db.runSql(`
      UPDATE survey_response AS sr
    SET entity_id = e.id
      FROM dhis_sync_log AS dsl,
      entity AS e
        WHERE sr.entity_id IS NULL AND
      sr.id = dsl.record_id AND
      e.code = CAST(data AS json) ->> 'orgUnit';
    `);
    /*
    And finally add non null constraint to
    entity_id on survey_response and read triggers
  */
    return db.runSql(`
      ALTER TABLE survey_response
      ALTER COLUMN entity_id SET NOT NULL;
      CREATE TRIGGER dhis_sync_queue_trigger
        BEFORE INSERT OR UPDATE ON public.dhis_sync_queue
        FOR EACH ROW EXECUTE PROCEDURE public.update_change_time();
      CREATE TRIGGER meditrak_sync_queue_trigger
        BEFORE INSERT OR UPDATE ON public.meditrak_sync_queue
        FOR EACH ROW EXECUTE PROCEDURE public.update_change_time();
  `);
  } catch (error) {
    console.log(error);
    return Promise.reject();
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
