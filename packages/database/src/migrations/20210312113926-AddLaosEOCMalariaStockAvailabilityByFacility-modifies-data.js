'use strict';

import { generateId, insertObject, codeToId } from '../utilities';

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

const MAP_OVERLAY_GROUP = {
  id: generateId(),
  name: 'Malaria Stock Availability by Facility',
  code: 'LA_Laos_EOC_Malaria_Stock_Availability',
};

const MULTI_ELEMENT_VALUES = [
  {
    name: 'All in stock',
    color: 'green',
    value: 'All in stock',
  },
  {
    name: 'At least 1 item out of stock',
    color: 'orange',
    value: 'At least 1 item out of stock',
  },
  {
    name: 'All out of stock',
    color: 'red',
    value: 'All out of stock',
  },
];

const SINGLE_ELEMENT_VALUES = [
  {
    name: 'In stock',
    color: 'green',
    value: 'In stock',
  },
  {
    name: 'Out of stock',
    color: 'red',
    value: 'Out of stock',
  },
];

const MAP_OVERLAYS = [
  {
    id: 'Laos_EOC_Malaria_ACT',
    name: 'ACT',
    measureBuilderConfig: {
      conditions: {
        'All in stock': {
          condition: {
            MAL_ACT_6x1: {
              operator: '>',
              value: 0,
            },
            MAL_ACT_6x2: {
              operator: '>',
              value: 0,
            },
            MAL_ACT_6x3: {
              operator: '>',
              value: 0,
            },
            MAL_ACT_6x4: {
              operator: '>',
              value: 0,
            },
          },
        },
        'At least 1 item out of stock': {
          conditionType: 'OR',
          condition: {
            MAL_ACT_6x1: {
              operator: '>',
              value: 0,
            },
            MAL_ACT_6x2: {
              operator: '>',
              value: 0,
            },
            MAL_ACT_6x3: {
              operator: '>',
              value: 0,
            },
            MAL_ACT_6x4: {
              operator: '>',
              value: 0,
            },
          },
        },
        'All out of stock': {
          condition: {
            MAL_ACT_6x1: 0,
            MAL_ACT_6x2: 0,
            MAL_ACT_6x3: 0,
            MAL_ACT_6x4: 0,
          },
        },
      },
      dataElementCodes: ['MAL_ACT_6x1', 'MAL_ACT_6x2', 'MAL_ACT_6x3', 'MAL_ACT_6x4'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
    presentationOptionsValues: MULTI_ELEMENT_VALUES,
  },
  {
    id: 'Laos_EOC_Malaria_Primaquine',
    name: 'Primaquine',
    measureBuilderConfig: {
      conditions: {
        'All in stock': {
          condition: {
            MAL_Primaquine_15_mg: {
              operator: '>',
              value: 0,
            },
            MAL_Primaquine_7_5_mg: {
              operator: '>',
              value: 0,
            },
          },
        },
        'At least 1 item out of stock': {
          conditionType: 'OR',
          condition: {
            MAL_Primaquine_15_mg: {
              operator: '>',
              value: 0,
            },
            MAL_Primaquine_7_5_mg: {
              operator: '>',
              value: 0,
            },
          },
        },
        'All out of stock': {
          condition: {
            MAL_Primaquine_15_mg: 0,
            MAL_Primaquine_7_5_mg: 0,
          },
        },
      },
      dataElementCodes: ['MAL_Primaquine_15_mg', 'MAL_Primaquine_7_5_mg'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
    presentationOptionsValues: MULTI_ELEMENT_VALUES,
  },
  {
    id: 'Laos_EOC_Malaria_RDT',
    name: 'Malaria Rapid Diagnostic Test (RDT)',
    measureBuilderConfig: {
      conditions: {
        'In stock': {
          condition: {
            MAL_RDT: {
              operator: '>',
              value: 0,
            },
          },
        },
        'Out of stock': {
          condition: {
            MAL_RDT: 0,
          },
        },
      },
      dataElementCodes: ['MAL_RDT'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
    presentationOptionsValues: SINGLE_ELEMENT_VALUES,
  },
  {
    id: 'Laos_EOC_Malaria_Artesunate',
    name: 'Artesunate 60mg',
    measureBuilderConfig: {
      conditions: {
        'In stock': {
          condition: {
            MAL_Artesunate: {
              operator: '>',
              value: 0,
            },
          },
        },
        'Out of stock': {
          condition: {
            MAL_Artesunate: 0,
          },
        },
      },
      dataElementCodes: ['MAL_Artesunate'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
    presentationOptionsValues: SINGLE_ELEMENT_VALUES,
  },
  {
    id: 'Laos_EOC_Malaria_Paracetamol',
    name: 'Paracetamol',
    measureBuilderConfig: {
      conditions: {
        'In stock': {
          condition: {
            MAL_Paracetamol: {
              operator: '>',
              value: 0,
            },
          },
        },
        'Out of stock': {
          condition: {
            MAL_Paracetamol: 0,
          },
        },
      },
      dataElementCodes: ['MAL_Paracetamol'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
    presentationOptionsValues: SINGLE_ELEMENT_VALUES,
  },
  {
    id: 'Laos_EOC_Malaria_G6PD_RDT',
    name: 'G6PD',
    measureBuilderConfig: {
      conditions: {
        'In stock': {
          condition: {
            MAL_G6PD_RDT: {
              operator: '>',
              value: 0,
            },
          },
        },
        'Out of stock': {
          condition: {
            MAL_G6PD_RDT: 0,
          },
        },
      },
      dataElementCodes: ['MAL_G6PD_RDT'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
    presentationOptionsValues: SINGLE_ELEMENT_VALUES,
  },
  {
    id: 'Laos_EOC_Malaria_ORS',
    name: 'ORS',
    measureBuilderConfig: {
      conditions: {
        'In stock': {
          condition: {
            MAL_ORS: {
              operator: '>',
              value: 0,
            },
          },
        },
        'Out of stock': {
          condition: {
            MAL_ORS: 0,
          },
        },
      },
      dataElementCodes: ['MAL_ORS'],
      entityAggregation: {
        dataSourceEntityType: 'facility',
      },
    },
    presentationOptionsValues: SINGLE_ELEMENT_VALUES,
  },
];

const BASE_PRESENTATION_OPTIONS = {
  displayType: 'color',
  measureLevel: 'Facility',
  hideByDefault: {
    null: true,
  },
  periodGranularity: 'one_month_at_a_time',
};

const BASE_OVERLAY = {
  dataElementCode: 'value',
  userGroup: 'Laos EOC User',
  isDataRegional: false,
  measureBuilder: 'checkMultiConditionsByOrgUnit',
  countryCodes: '{LA}',
  projectCodes: '{laos_eoc}',
};

exports.up = async function (db) {
  const rootMapOverlayGroupId = await codeToId(db, 'map_overlay_group', 'Root');

  await insertObject(db, 'map_overlay_group', MAP_OVERLAY_GROUP);

  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: rootMapOverlayGroupId,
    child_id: MAP_OVERLAY_GROUP.id,
    child_type: 'mapOverlayGroup',
  });

  for (let i = 0; i < MAP_OVERLAYS.length; i++) {
    const overlay = MAP_OVERLAYS[i];
    const { id, name, measureBuilderConfig, presentationOptionsValues } = overlay;
    await insertObject(db, 'mapOverlay', {
      ...BASE_OVERLAY,
      id,
      name,
      measureBuilderConfig,
      presentationOptions: {
        ...BASE_PRESENTATION_OPTIONS,
        values: presentationOptionsValues,
      },
    });

    const relation = {
      id: generateId(),
      map_overlay_group_id: MAP_OVERLAY_GROUP.id,
      child_id: overlay.id,
      child_type: 'mapOverlay',
      sort_order: i,
    };

    await insertObject(db, 'map_overlay_group_relation', relation);
  }
};

exports.down = async function (db) {
  for (const overlay of MAP_OVERLAYS) {
    await db.runSql(`DELETE FROM map_overlay_group_relation WHERE child_id = '${overlay.id}';`);

    await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${overlay.id}';`);
  }

  const overlayGroupId = await codeToId(db, 'map_overlay_group', MAP_OVERLAY_GROUP.code);

  await db.runSql(`DELETE FROM map_overlay_group_relation WHERE child_id = '${overlayGroupId}';`);

  await db.runSql(`DELETE FROM "map_overlay_group" WHERE code = '${MAP_OVERLAY_GROUP.code}';`);
};

exports._meta = {
  version: 1,
};
