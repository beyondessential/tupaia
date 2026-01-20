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

const MAP_OVERLAYS = [
  {
    id: 'Laos_EOC_Malaria_ACT',
    oldMeasureBuilderConfig: {
      conditions: {
        'All in stock': {
          condition: {
            MAL_3645d4bf: {
              operator: '>',
              value: 0,
            },
            MAL_199ffeec: {
              operator: '>',
              value: 0,
            },
            MAL_46cfdeec: {
              operator: '>',
              value: 0,
            },
            MAL_566bceec: {
              operator: '>',
              value: 0,
            },
          },
        },
        'At least 1 item out of stock': {
          conditionType: 'OR',
          condition: {
            MAL_3645d4bf: 0,
            MAL_199ffeec: 0,
            MAL_46cfdeec: 0,
            MAL_566bceec: 0,
          },
        },
        'All out of stock': {
          condition: {
            MAL_3645d4bf: 0,
            MAL_199ffeec: 0,
            MAL_46cfdeec: 0,
            MAL_566bceec: 0,
          },
        },
      },
      dataElementCodes: ['MAL_3645d4bf', 'MAL_199ffeec', 'MAL_46cfdeec', 'MAL_566bceec'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
    newMeasureBuilderConfig: {
      conditions: {
        'All in stock': {
          condition: {
            MAL_3645d4bf: {
              operator: '>',
              value: 0,
            },
            MAL_199ffeec: {
              operator: '>',
              value: 0,
            },
            MAL_46cfdeec: {
              operator: '>',
              value: 0,
            },
            MAL_566bceec: {
              operator: '>',
              value: 0,
            },
          },
        },
        'At least 1 item out of stock': {
          // Changed
          conditionType: 'OR',
          condition: {
            MAL_3645d4bf: {
              operator: '>',
              value: 0,
            },
            MAL_199ffeec: {
              operator: '>',
              value: 0,
            },
            MAL_46cfdeec: {
              operator: '>',
              value: 0,
            },
            MAL_566bceec: {
              operator: '>',
              value: 0,
            },
          },
        },
        'All out of stock': {
          condition: {
            MAL_3645d4bf: 0,
            MAL_199ffeec: 0,
            MAL_46cfdeec: 0,
            MAL_566bceec: 0,
          },
        },
      },
      dataElementCodes: ['MAL_3645d4bf', 'MAL_199ffeec', 'MAL_46cfdeec', 'MAL_566bceec'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
  },
  {
    id: 'Laos_EOC_Malaria_Primaquine',
    oldMeasureBuilderConfig: {
      conditions: {
        'All in stock': {
          condition: {
            MAL_5de7d4bf: {
              operator: '>',
              value: 0,
            },
            MAL_5de2a4bf: {
              operator: '>',
              value: 0,
            },
          },
        },
        'At least 1 item out of stock': {
          conditionType: 'OR',
          condition: {
            MAL_5de7d4bf: 0,
            MAL_5de2a4bf: 0,
          },
        },
        'All out of stock': {
          condition: {
            MAL_5de7d4bf: 0,
            MAL_5de2a4bf: 0,
          },
        },
      },
      dataElementCodes: ['MAL_5de7d4bf', 'MAL_5de2a4bf'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
    newMeasureBuilderConfig: {
      conditions: {
        'All in stock': {
          condition: {
            MAL_5de7d4bf: {
              operator: '>',
              value: 0,
            },
            MAL_5de2a4bf: {
              operator: '>',
              value: 0,
            },
          },
        },
        'At least 1 item out of stock': {
          // Changed
          conditionType: 'OR',
          condition: {
            MAL_5de7d4bf: {
              operator: '>',
              value: 0,
            },
            MAL_5de2a4bf: {
              operator: '>',
              value: 0,
            },
          },
        },
        'All out of stock': {
          condition: {
            MAL_5de7d4bf: 0,
            MAL_5de2a4bf: 0,
          },
        },
      },
      dataElementCodes: ['MAL_5de7d4bf', 'MAL_5de2a4bf'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
  },
];

exports.up = async function (db) {
  for (const overlay of MAP_OVERLAYS) {
    const { id, newMeasureBuilderConfig } = overlay;
    await db.runSql(`
      UPDATE "mapOverlay"
      SET "measureBuilderConfig" = '${JSON.stringify(newMeasureBuilderConfig)}'
      WHERE id = '${id}'
    `);
  }
};

exports.down = async function (db) {
  for (const overlay of MAP_OVERLAYS) {
    const { id, oldMeasureBuilderConfig } = overlay;
    await db.runSql(`
      UPDATE "mapOverlay"
      SET "measureBuilderConfig" = '${JSON.stringify(oldMeasureBuilderConfig)}'
      WHERE id = '${id}'
    `);
  }
};

exports._meta = {
  version: 1,
};
