'use strict';

var dbm;
var type;
var seed;

const ID_TO_AGGREGATION_TYPE = {};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};
const deleteEntityTypes = async (db, id, configPath) => {
  await db.runSql(`
    update "mapOverlay"
    set "measureBuilderConfig" = "measureBuilderConfig" #- '{${configPath}dataSourceEntityType}'
    where id='${id}';
  `);
  // Nested level aggregation is occurring, don't leave aggregationEntityType for other migration
  if (configPath) {
    await db.runSql(`
      update "mapOverlay"
      set "measureBuilderConfig" = "measureBuilderConfig" #- '{${configPath}aggregationEntityType}'
      where id='${id}';
    `);
  }
};

// args example: '1', [object], 'measureBuilders,population,measureBuilderConfig,', false
const updateConfig = async (
  db,
  id,
  measureBuilderConfig,
  configPath,
  globalAggregationEntityType,
) => {
  const { aggregationEntityType = globalAggregationEntityType } = measureBuilderConfig;
  const { dataSourceEntityType } = measureBuilderConfig;

  if (dataSourceEntityType && aggregationEntityType) {
    if (dataSourceEntityType === aggregationEntityType) {
      // No need for aggregationType or aggregationEntityType
      await db.runSql(`
        update "mapOverlay"
        set "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{${configPath}entityAggregation}', '{
          "dataSourceEntityType": "${dataSourceEntityType}"
        }')
        where id='${id}';
      `);
    } else {
      await db.runSql(`
        update "mapOverlay"
        set "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{${configPath}entityAggregation}', '{
          "dataSourceEntityType": "${dataSourceEntityType}",
          "aggregationEntityType": "${aggregationEntityType}",
          "aggregationType": "${ID_TO_AGGREGATION_TYPE[id] || 'REPLACE_ORG_UNIT_WITH_ORG_GROUP'}"
        }')
        where id='${id}';
      `);
    }
  }
  // No matter what, we delete the existing config
  await deleteEntityTypes(db, id, configPath);
};

exports.up = async function (db) {
  const allOverlays = (await db.runSql(`select * from "mapOverlay"`)).rows;
  return Promise.all(
    allOverlays.map(async ({ id, measureBuilderConfig }) => {
      const globalAggregationEntityType = measureBuilderConfig.aggregationEntityType;
      if (!globalAggregationEntityType) throw new Error('Migrations run in wrong order');

      // Nested aggregation, only the 3 specified cases are supported
      const { measureBuilderConfig: nestedConfig, measureBuilders } = measureBuilderConfig;
      if (nestedConfig) {
        const { measureBuilders: nestedMeasureBuilders } = nestedConfig;

        if (nestedMeasureBuilders) {
          /* e.g.
           * measureBuilderConfig:{
           *   measureBuilderConfig: {
           *     measureBuilders:{
           *       population: {
           *         measureBuilderConfig:{
           *           aggregationEntityType:
           *           dataSourceEntityType:
           *                }
           *             }
           *          }
           *       }
           *    }
           */
          Object.entries(nestedMeasureBuilders).forEach(
            async ([code, { measureBuilderConfig: deepNestedConfig }]) => {
              await updateConfig(
                db,
                id,
                deepNestedConfig,
                `measureBuilderConfig,measureBuilders,${code},measureBuilderConfig,`,
                false,
                globalAggregationEntityType,
              );
            },
          );
          // delete extranious entity types
          await deleteEntityTypes(db, id, 'measureBuilderConfig,');
        } else {
          /* e.g.
           * measureBuilderConfig:{
           *   measureBuilderConfig: {
           *     aggregationEntityType:
           *     dataSourceEntityType:
           *   }
           * }
           */
          await updateConfig(
            db,
            id,
            nestedConfig,
            'measureBuilderConfig,',
            false,
            globalAggregationEntityType,
          );
        }
      } else if (measureBuilders) {
        /* e.g.
         * measureBuilderConfig:{
         *     measureBuilders:{
         *       population: {
         *         measureBuilderConfig:{
         *           aggregationEntityType:
         *           dataSourceEntityType:
         *         }
         *       }
         *     }
         * }
         */
        Object.entries(measureBuilders).forEach(
          async ([code, { measureBuilderConfig: deepNestedConfig }]) => {
            await updateConfig(
              db,
              id,
              deepNestedConfig,
              `measureBuilders,${code},measureBuilderConfig,`,
              false,
              globalAggregationEntityType,
            );
          },
        );
      }
      // Top level aggregation (only if there was no nested aggregation)
      /* e.g.
       * measureBuilderConfig:{
       *    aggregationEntityType:
       *    dataSourceEntityType:
       * }
       */
      if (!measureBuilders && !nestedConfig) {
        await updateConfig(db, id, measureBuilderConfig, '', true, globalAggregationEntityType);
      } else {
        // Entity aggregation has been handled elsewhere, we don't need it at the top level
        await deleteEntityTypes(db, id, '');
      }
    }),
  );
};

exports.down = async function (db) {
  // No down function
};

exports._meta = {
  version: 1,
};
