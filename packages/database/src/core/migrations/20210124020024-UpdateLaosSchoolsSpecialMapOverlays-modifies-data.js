'use strict';

var dbm;
var type;
var seed;

// These overlays have quite tricky config that it is hard to update Yes/No to 1/0 using regex in a generalised way.
// So this migration is to custom update each of them
const OVERLAYS = [
  {
    id: 'Laos_Schools_Functioning_TV_Satellite',
    oldMeasureBuilderConfig: {
      conditions: {
        No: {
          SchCVD012: 'No',
        },
        Yes: {
          SchCVD012: 'Yes',
          SchCVD012a: 'No',
        },
        'Yes, smart TV': {
          SchCVD012: 'Yes',
          SchCVD012a: 'Yes',
        },
      },
      dataElementCodes: ['SchCVD012', 'SchCVD012a'],
      entityAggregation: {
        dataSourceEntityType: 'school',
      },
    },
    newMeasureBuilderConfig: {
      conditions: {
        No: {
          SchCVD012: 0,
        },
        Yes: {
          SchCVD012: 1,
          SchCVD012a: 0,
        },
        'Yes, smart TV': {
          SchCVD012: 1,
          SchCVD012a: 1,
        },
      },
      dataElementCodes: ['SchCVD012', 'SchCVD012a'],
      entityAggregation: {
        dataSourceEntityType: 'school',
      },
    },
  },
  {
    id: 'Laos_Schools_School_Indicators_EiE_School_Implementing_MOES',
    oldPresentationOptions: {
      values: [
        {
          name: 'Yes, fully',
          color: 'green',
          value: 'Yes, fully',
        },
        {
          name: 'Yes, partially',
          color: 'yellow',
          value: 'Yes, partially',
        },
        {
          name: 'No',
          color: 'red',
          value: 'No',
        },
      ],
      displayType: 'color',
      measureLevel: 'School',
      hideByDefault: {
        null: true,
      },
      displayOnLevel: 'District',
    },
    newPresentationOptions: {
      values: [
        {
          name: 'Yes, fully',
          color: 'green',
          value:
            'Yes, fully. All protocols are in place (social distancing is practiced in the school, temperature checks regularly undertaken, all children have access to clean water and soap and practice hand washing, all students and school staff wear masks).',
        },
        {
          name: 'Yes, partially',
          color: 'yellow',
          value: 'Yes, partially. Some of the protocols are in place.',
        },
        {
          name: 'No',
          color: 'red',
          value: 'No. None of the protocols are in place.',
        },
      ],
      displayType: 'color',
      measureLevel: 'School',
      hideByDefault: {
        null: true,
      },
      displayOnLevel: 'District',
    },
  },
  {
    id: 'Laos_Schools_Teachers_Follow_MoES_Education_Show',
    oldMeasureBuilderConfig: {
      groups: {
        Multiple: {
          value: ', ',
          operator: 'regex',
        },
        SchCVD016: {
          value: 'No',
          operator: '=',
        },
        SchCVD016a: {
          value: 'TV',
          operator: '=',
        },
        SchCVD016b: {
          value: 'Radio',
          operator: '=',
        },
        SchCVD016c: {
          value: 'Online',
          operator: '=',
        },
      },
      measureBuilder: 'getStringsFromBinaryData',
      measureBuilderConfig: {
        entityAggregation: {
          dataSourceEntityType: 'school',
        },
        dataElementToString: {
          SchCVD016: {
            displayString: 'No',
            valueOfInterest: 'No',
          },
          SchCVD016a: {
            displayString: 'TV',
            valueOfInterest: 'Yes',
          },
          SchCVD016b: {
            displayString: 'Radio',
            valueOfInterest: 'Yes',
          },
          SchCVD016c: {
            displayString: 'Online',
            valueOfInterest: 'Yes',
          },
        },
      },
    },
    newMeasureBuilderConfig: {
      groups: {
        Multiple: {
          value: ', ',
          operator: 'regex',
        },
        SchCVD016: {
          value: 'No',
          operator: '=',
        },
        SchCVD016a: {
          value: 'TV',
          operator: '=',
        },
        SchCVD016b: {
          value: 'Radio',
          operator: '=',
        },
        SchCVD016c: {
          value: 'Online',
          operator: '=',
        },
      },
      measureBuilder: 'getStringsFromBinaryData',
      measureBuilderConfig: {
        entityAggregation: {
          dataSourceEntityType: 'school',
        },
        dataElementToString: {
          SchCVD016: {
            displayString: 'No',
            valueOfInterest: 0,
          },
          SchCVD016a: {
            displayString: 'TV',
            valueOfInterest: 1,
          },
          SchCVD016b: {
            displayString: 'Radio',
            valueOfInterest: 1,
          },
          SchCVD016c: {
            displayString: 'Online',
            valueOfInterest: 1,
          },
        },
      },
    },
  },
  {
    id: 'Laos_Schools_Students_Follow_MoES_Education_Show',
    oldMeasureBuilderConfig: {
      groups: {
        Multiple: {
          value: ', ',
          operator: 'regex',
        },
        SchCVD017: {
          value: 'No',
          operator: '=',
        },
        SchCVD017a: {
          value: 'TV',
          operator: '=',
        },
        SchCVD017b: {
          value: 'Radio',
          operator: '=',
        },
        SchCVD017c: {
          value: 'Online',
          operator: '=',
        },
      },
      measureBuilder: 'getStringsFromBinaryData',
      measureBuilderConfig: {
        entityAggregation: {
          dataSourceEntityType: 'school',
        },
        dataElementToString: {
          SchCVD017: {
            displayString: 'No',
            valueOfInterest: 'No',
          },
          SchCVD017a: {
            displayString: 'TV',
            valueOfInterest: 'Yes',
          },
          SchCVD017b: {
            displayString: 'Radio',
            valueOfInterest: 'Yes',
          },
          SchCVD017c: {
            displayString: 'Online',
            valueOfInterest: 'Yes',
          },
        },
      },
    },
    newMeasureBuilderConfig: {
      groups: {
        Multiple: {
          value: ', ',
          operator: 'regex',
        },
        SchCVD017: {
          value: 'No',
          operator: '=',
        },
        SchCVD017a: {
          value: 'TV',
          operator: '=',
        },
        SchCVD017b: {
          value: 'Radio',
          operator: '=',
        },
        SchCVD017c: {
          value: 'Online',
          operator: '=',
        },
      },
      measureBuilder: 'getStringsFromBinaryData',
      measureBuilderConfig: {
        entityAggregation: {
          dataSourceEntityType: 'school',
        },
        dataElementToString: {
          SchCVD017: {
            displayString: 'No',
            valueOfInterest: 0,
          },
          SchCVD017a: {
            displayString: 'TV',
            valueOfInterest: 1,
          },
          SchCVD017b: {
            displayString: 'Radio',
            valueOfInterest: 1,
          },
          SchCVD017c: {
            displayString: 'Online',
            valueOfInterest: 1,
          },
        },
      },
    },
  },
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

exports.up = async function (db) {
  for (const overlay of OVERLAYS) {
    if (overlay.newMeasureBuilderConfig) {
      await db.runSql(`
        update "mapOverlay" mo
        set "measureBuilderConfig" = '${JSON.stringify(overlay.newMeasureBuilderConfig)}'
        where id = '${overlay.id}'
      `);
    }

    if (overlay.newPresentationOptions) {
      await db.runSql(`
        update "mapOverlay" mo
        set "measureBuilderConfig" = '${JSON.stringify(overlay.newPresentationOptions)}'
        where id = '${overlay.id}'
      `);
    }
  }
};

exports.down = async function (db) {
  for (const overlay of OVERLAYS) {
    if (overlay.oldMeasureBuilderConfig) {
      await db.runSql(`
        update "mapOverlay" mo
        set "measureBuilderConfig" = '${JSON.stringify(overlay.oldMeasureBuilderConfig)}'
        where id = '${overlay.id}'
      `);
    }

    if (overlay.oldPresentationOptions) {
      await db.runSql(`
        update "mapOverlay" mo
        set "measureBuilderConfig" = '${JSON.stringify(overlay.oldPresentationOptions)}'
        where id = '${overlay.id}'
      `);
    }
  }
};

exports._meta = {
  version: 1,
};
