'use strict';

import { arrayToDbString } from '../utilities';

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

const newMapOverlayOrders = [
  {
    groupCode: 'mRDT_Positive_by_Result_Health_Facility_Data_Source_CRF',
    groupNewName: 'STRIVE Febrile Illness Health Facility Data (Source CRF)',
    overlays: [
      { overlayId: 'STRIVE_CRF_Positive' },
      {
        overlayId: 'STRIVE_CRF_Positive_Pf_Percentage',
        overlayNewName: '% mRDT Positive: Positive Pf',
      },
      {
        overlayId: 'STRIVE_CRF_Positive_Non_Pf_Percentage',
        overlayNewName: '% mRDT Positive: Positive Non-Pf',
      },
      {
        overlayId: 'STRIVE_CRF_Positive_Mixed_Percentage',
        overlayNewName: '% mRDT Positive: Positive Mixed',
      },
      {
        overlayId: 'STRIVE_CRF_Febrile_Cases_Radius',
      },
      { overlayId: 'STRIVE_WTF_mRDT_Tests_Radius' },
    ],
  },
  {
    groupCode: 'STRIVE_PNG_Health_Facility_Data_Source_WTF',
    groupNewName: 'STRIVE WTF Health Facility Data',
  },
  {
    groupCode: 'STRIVE_Febrile_illness_surveilance_Village',
    groupNewName: 'STRIVE Febrile Illness Village Level Data',
    overlays: [
      {
        overlayId: 'STRIVE_FIS_Village_Number_Reported_Cases_In_Week',
        overlayNewName: 'Febrile illness cases (STRIVE cases)',
      },
      {
        overlayId: 'STRIVE_FIS_Village_Percent_mRDT_Positive_Mixed_In_Week',
      },
      {
        overlayId: 'STRIVE_FIS_Village_Percent_mRDT_Positive_In_Week',
      },
      {
        overlayId: 'STRIVE_FIS_Village_Percent_mRDT_Positive_Non_PF_In_Week',
      },
      {
        overlayId: 'STRIVE_FIS_Village_Percent_mRDT_Positive_PF_In_Week',
      },
    ],
  },
  {
    groupCode: 'STRIVE_Molecular_Data',
  },
  {
    groupCode: 'STRIVE_Vector_Data',
    groupNewName: 'STRIVE Vector Data',
  },
];

exports.up = async function (db) {
  // Rename map overlay groups
  const overlayGroupsMapping = newMapOverlayOrders.filter(({ groupNewName }) => !!groupNewName);
  for (const { groupCode, groupNewName } of overlayGroupsMapping) {
    await db.runSql(`
        UPDATE map_overlay_group
        SET name = '${groupNewName}'
        WHERE code = '${groupCode}';
    `);
  }

  // Check if map overlay groups have relations to other projects
  const { rows } = await db.runSql(`
        SELECT * FROM map_overlay_group_relation mogr
        WHERE mogr.child_id in (
            SELECT mog.id FROM map_overlay_group mog
            WHERE mog.code in (${arrayToDbString(newMapOverlayOrders.map(mo => mo.groupCode))})
        );
    `);
  if (rows.length !== newMapOverlayOrders.length) {
    throw new Error('Some map overlay groups have relations to other projects.');
  }

  // Order map overlay groups
  await Promise.all(
    newMapOverlayOrders.map(async ({ groupCode }, sortOrder) => {
      await db.runSql(`
            UPDATE map_overlay_group_relation
            SET sort_order = '${sortOrder}'
            WHERE child_id = (
                SELECT mog.id FROM map_overlay_group mog
                WHERE mog.code = '${groupCode}'
            )
        `);
    }),
  );

  await Promise.all(
    newMapOverlayOrders
      .filter(({ overlays }) => !!overlays)
      .map(async ({ groupCode, overlays }) => {
        // Rename map overlays
        const renamingOverlaysMapping = overlays.filter(mo => !!mo.overlayNewName);
        await Promise.all(
          renamingOverlaysMapping.map(async ({ overlayId, overlayNewName }) => {
            await db.runSql(`
              UPDATE "mapOverlay"
              SET name = '${overlayNewName}'
              WHERE id = '${overlayId}';
          `);
          }),
        );

        // Order map overlays
        await Promise.all(
          overlays.map(async ({ overlayId }, sortOrder) => {
            await db.runSql(`
            UPDATE map_overlay_group_relation
            SET sort_order = '${sortOrder}',
            map_overlay_group_id = (
              SELECT mog.id FROM map_overlay_group mog
              WHERE mog.code = '${groupCode}'
            )
            WHERE child_id = '${overlayId}';
        `);
          }),
        );
      }),
  );

  // Drop a map overlay group
  const mapOverlayGroupToDrop = 'STRIVE_PNG_Health_Facility_Data_Source_CRF';
  await db.runSql(`
        DELETE FROM map_overlay_group_relation mogr
        USING map_overlay_group mog
        WHERE mog.code = '${mapOverlayGroupToDrop}' 
        AND (mog.id = mogr.map_overlay_group_id OR mog.id = mogr.child_id);

        DELETE FROM map_overlay_group
        WHERE code = '${mapOverlayGroupToDrop}';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
