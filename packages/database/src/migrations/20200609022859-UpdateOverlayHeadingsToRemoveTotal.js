'use strict';

var dbm;
var type;
var seed;

const OVERLAY_IDS = [
  // Could autogenerate these but there aren't too many
  'Laos_Schools_Total_Drop_Out_Grade_1_District',
  'Laos_Schools_Total_Drop_Out_Grade_2_District',
  'Laos_Schools_Total_Drop_Out_Grade_3_District',
  'Laos_Schools_Total_Drop_Out_Grade_4_District',
  'Laos_Schools_Total_Drop_Out_Grade_5_District',
  'Laos_Schools_Total_Drop_Out_Grade_6_District',
  'Laos_Schools_Total_Drop_Out_Grade_7_District',
  'Laos_Schools_Total_Drop_Out_Grade_8_District',
  'Laos_Schools_Total_Drop_Out_Grade_9_District',
  'Laos_Schools_Total_Drop_Out_Grade_10_District',
  'Laos_Schools_Total_Drop_Out_Grade_11_District',
  'Laos_Schools_Total_Drop_Out_Grade_12_District',
  'Laos_Schools_Total_Drop_Out_Primary_District',
  'Laos_Schools_Total_Drop_Out_Lower_Secondary_District',
  'Laos_Schools_Total_Drop_Out_Upper_Secondary_District',
  'Laos_Schools_Total_Drop_Out_Grade_1_Province',
  'Laos_Schools_Total_Drop_Out_Grade_2_Province',
  'Laos_Schools_Total_Drop_Out_Grade_3_Province',
  'Laos_Schools_Total_Drop_Out_Grade_4_Province',
  'Laos_Schools_Total_Drop_Out_Grade_5_Province',
  'Laos_Schools_Total_Drop_Out_Grade_6_Province',
  'Laos_Schools_Total_Drop_Out_Grade_7_Province',
  'Laos_Schools_Total_Drop_Out_Grade_8_Province',
  'Laos_Schools_Total_Drop_Out_Grade_9_Province',
  'Laos_Schools_Total_Drop_Out_Grade_10_Province',
  'Laos_Schools_Total_Drop_Out_Grade_11_Province',
  'Laos_Schools_Total_Drop_Out_Grade_12_Province',
  'Laos_Schools_Total_Drop_Out_Primary_Province',
  'Laos_Schools_Total_Drop_Out_Lower_Secondary_Province',
  'Laos_Schools_Total_Drop_Out_Upper_Secondary_Province',
  'Laos_Schools_Total_Repetition_Grade_1_District',
  'Laos_Schools_Total_Repetition_Grade_2_District',
  'Laos_Schools_Total_Repetition_Grade_3_District',
  'Laos_Schools_Total_Repetition_Grade_4_District',
  'Laos_Schools_Total_Repetition_Grade_5_District',
  'Laos_Schools_Total_Repetition_Grade_6_District',
  'Laos_Schools_Total_Repetition_Grade_7_District',
  'Laos_Schools_Total_Repetition_Grade_8_District',
  'Laos_Schools_Total_Repetition_Grade_9_District',
  'Laos_Schools_Total_Repetition_Grade_8_Province',
  'Laos_Schools_Total_Repetition_Grade_10_District',
  'Laos_Schools_Total_Repetition_Grade_11_District',
  'Laos_Schools_Total_Repetition_Grade_12_District',
  'Laos_Schools_Total_Repetition_Primary_District',
  'Laos_Schools_Total_Repetition_Lower_Secondary_District',
  'Laos_Schools_Total_Repetition_Upper_Secondary_District',
  'Laos_Schools_Total_Repetition_Grade_1_Province',
  'Laos_Schools_Total_Repetition_Grade_2_Province',
  'Laos_Schools_Total_Repetition_Grade_3_Province',
  'Laos_Schools_Total_Repetition_Grade_4_Province',
  'Laos_Schools_Total_Repetition_Grade_5_Province',
  'Laos_Schools_Total_Repetition_Grade_6_Province',
  'Laos_Schools_Total_Repetition_Grade_7_Province',
  'Laos_Schools_Total_Repetition_Grade_9_Province',
  'Laos_Schools_Total_Repetition_Grade_10_Province',
  'Laos_Schools_Total_Repetition_Grade_11_Province',
  'Laos_Schools_Total_Repetition_Grade_12_Province',
  'Laos_Schools_Total_Repetition_Primary_Province',
  'Laos_Schools_Total_Repetition_Lower_Secondary_Province',
  'Laos_Schools_Total_Repetition_Upper_Secondary_Province',
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return Promise.all(
    OVERLAY_IDS.map(async overlayId => {
      const { name, groupName } = (
        await db.runSql(`select * from "mapOverlay" where id = '${overlayId}'`)
      ).rows[0];
      const strippedName = name.replace('Total ', '');
      const capitalizedName = strippedName.charAt(0).toUpperCase() + strippedName.slice(1);
      return db.runSql(`
        update "mapOverlay"
        set
          "name" = '${capitalizedName}',
          "groupName" = '${groupName.replace('Total ', '')}'
        where id = '${overlayId}';
      `);
    }),
  );
};

exports.down = function (db) {
  return Promise.all(
    OVERLAY_IDS.map(async overlayId => {
      const { name, groupName } = (
        await db.runSql(`select * from "mapOverlay" where id = '${overlayId}'`)
      ).rows[0];
      const uncapitalizedName = name.charAt(0).toLowerCase() + name.slice(1);
      return db.runSql(`
        update "mapOverlay"
        set
          "name" = '${`Total ${uncapitalizedName}`}',
          "groupName" = '${`Total ${groupName}`}'
        where id = '${overlayId}';
      `);
    }),
  );
};

exports._meta = {
  version: 1,
};
