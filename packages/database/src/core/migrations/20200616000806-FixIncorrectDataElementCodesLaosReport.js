'use strict';

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

exports.up = async function (db) {
  const updateCode = code => code.replace('Drop', 'Rep');

  const reports = await db.runSql(`
    select * from "dashboardReport"
    where id like 'Laos_Schools_Repeaters_Bar%';
  `);
  return Promise.all(
    reports.rows.map(({ id, dataBuilderConfig }) => {
      const newDataBuilders = {};

      Object.entries(dataBuilderConfig.dataBuilders).forEach(([key, config]) => {
        const newConfig = { ...config };
        const newLabels = {};
        Object.entries(newConfig.dataBuilderConfig.labels).forEach(([code, label]) => {
          newLabels[updateCode(code)] = label;
        });
        newConfig.dataBuilderConfig.labels = newLabels;
        newConfig.dataBuilderConfig.dataElementCodes = newConfig.dataBuilderConfig.dataElementCodes.map(
          updateCode,
        );
        newDataBuilders[key] = newConfig;
      });

      const newDataBuilderConfig = { ...dataBuilderConfig, dataBuilders: newDataBuilders };

      return db.runSql(`
        update "dashboardReport"
        set "dataBuilderConfig" = '${JSON.stringify(newDataBuilderConfig)}'
        where id='${id}';
      `);
    }),
  );
};

exports.down = async function (db) {
  const updateCode = code => code.replace('Rep', 'Drop');

  const reports = await db.runSql(`
    select * from "dashboardReport"
    where id like 'Laos_Schools_Repeaters_Bar%';
  `);
  return Promise.all(
    reports.rows.map(({ id, dataBuilderConfig }) => {
      const newDataBuilders = {};

      Object.entries(dataBuilderConfig.dataBuilders).forEach(([key, config]) => {
        const newConfig = { ...config };
        const newLabels = {};
        Object.entries(newConfig.dataBuilderConfig.labels).forEach(([code, label]) => {
          newLabels[updateCode(code)] = label;
        });
        newConfig.dataBuilderConfig.labels = newLabels;
        newConfig.dataBuilderConfig.dataElementCodes = newConfig.dataBuilderConfig.dataElementCodes.map(
          updateCode,
        );
        newDataBuilders[key] = newConfig;
      });

      const newDataBuilderConfig = { ...dataBuilderConfig, dataBuilders: newDataBuilders };

      return db.runSql(`
      update "dashboardReport"
      set "dataBuilderConfig" = '${JSON.stringify(newDataBuilderConfig)}'
      where id='${id}';
    `);
    }),
  );
};

exports._meta = {
  version: 1,
};
