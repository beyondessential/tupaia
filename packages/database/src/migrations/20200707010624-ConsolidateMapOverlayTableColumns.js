'use strict';

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

const dropMapOverlayRedundantColumns = async db => {
  await db.runSql(`
    ALTER TABLE "mapOverlay" 
    DROP COLUMN "displayType", 
    DROP COLUMN "customColors", 
    DROP COLUMN "values", 
    DROP COLUMN "hideFromMenu", 
    DROP COLUMN "hideFromPopup", 
    DROP COLUMN "hideFromLegend";
`);
};

const recreateMapOverlayRedundantColumns = async db => {
  await db.runSql(`
    ALTER TABLE "mapOverlay" 
    ADD COLUMN "displayType" text, 
    ADD COLUMN "customColors" text,
    ADD COLUMN "values" jsonb, 
    ADD COLUMN "hideFromMenu" boolean, 
    ADD COLUMN "hideFromPopup" boolean,
    ADD COLUMN "hideFromLegend" boolean;
`);
};

const selectAllMapOverlays = async db => db.runSql('SELECT * FROM "mapOverlay";');

exports.up = async function(db) {
  const mapOverlayRows = (await selectAllMapOverlays(db)).rows;

  await Promise.all(
    mapOverlayRows.map(mapOverlay => {
      const {
        displayType,
        customColors,
        values,
        hideFromMenu,
        hideFromPopup,
        hideFromLegend,
        presentationOptions,
        id,
      } = mapOverlay;

      let newPresentationOptions = {
        ...presentationOptions,
        displayType,
      };

      //Some of these columns can be null/false by default.
      //So I only add them into the presentationOptions config if they are not empty/true.
      //measureData.js will be the place where we populate the default values for these config.
      if (customColors) {
        newPresentationOptions = {
          ...newPresentationOptions,
          customColors,
        };
      }

      if (values) {
        newPresentationOptions = {
          ...newPresentationOptions,
          values,
        };
      }

      if (hideFromMenu) {
        newPresentationOptions = {
          ...newPresentationOptions,
          hideFromMenu,
        };
      }

      if (hideFromPopup) {
        newPresentationOptions = {
          ...newPresentationOptions,
          hideFromPopup,
        };
      }

      if (hideFromLegend) {
        newPresentationOptions = {
          ...newPresentationOptions,
          hideFromLegend,
        };
      }

      return db.runSql(`
        UPDATE "mapOverlay"
        SET "presentationOptions" = '${JSON.stringify(newPresentationOptions)}'
        WHERE id = '${id}';
    `);
    }),
  );

  await dropMapOverlayRedundantColumns(db);
};

exports.down = async function(db) {
  await recreateMapOverlayRedundantColumns(db);

  const mapOverlayRows = await selectAllMapOverlays(db).rows;

  await Promise.all(
    mapOverlayRows.map(mapOverlay => {
      const { presentationOptions, id } = mapOverlay;
      const {
        displayType,
        customColors = null,
        values = null,
        hideFromMenu = false,
        hideFromPopup = false,
        hideFromLegend = false,
      } = presentationOptions;

      delete presentationOptions.displayType;
      delete presentationOptions.customColors;
      delete presentationOptions.values;
      delete presentationOptions.hideFromMenu;
      delete presentationOptions.hideFromPopup;
      delete presentationOptions.hideFromLegend;

      return db.runSql(`
        UPDATE "mapOverlay"
        SET "presentationOptions" = '${JSON.stringify(presentationOptions)}',
        "displayType" = '${displayType}',
        "customColors" = '${customColors}',
        "values" = '${JSON.stringify(values)}',
        "hideFromMenu" = ${hideFromMenu},
        "hideFromPopup" = ${hideFromPopup},
        "hideFromLegend" = ${hideFromLegend}
        WHERE id = '${id}';
    `);
    }),
  );
};

exports._meta = {
  version: 1,
};
