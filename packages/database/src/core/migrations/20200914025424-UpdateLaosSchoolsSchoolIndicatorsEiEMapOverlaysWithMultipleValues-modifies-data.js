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
    id: 'Laos_Schools_Teachers_Follow_MoES_Education_Show',
    oldName: 'Teachers follow the MoES education shows on TV',
    newName: 'Teachers follow MoES education programmes at home',
    oldDataElementCode: 'SchCVD016',
    newDataElementCode: 'value',
    oldMeasureBuilder: 'valueForOrgGroup',
    newMeasureBuilder: 'groupData',
    oldMeasureBuilderConfig: {
      entityAggregation: {
        dataSourceEntityType: 'school',
      },
    },
    newMeasureBuilderConfig: {
      groups: {
        Multiple: {
          value: ', ',
          operator: 'regex',
        },
        SchCVD016c: {
          value: 'Online',
          operator: '=',
        },
        SchCVD016b: {
          value: 'Radio',
          operator: '=',
        },
        SchCVD016a: {
          value: 'TV',
          operator: '=',
        },
        SchCVD016: {
          value: 'No',
          operator: '=',
        },
      },
      measureBuilder: 'getStringsFromBinaryData',
      measureBuilderConfig: {
        entityAggregation: {
          dataSourceEntityType: 'school',
        },
        dataElementToString: {
          SchCVD016c: {
            displayString: 'Online',
            valueOfInterest: 'Yes',
          },
          SchCVD016b: {
            displayString: 'Radio',
            valueOfInterest: 'Yes',
          },
          SchCVD016a: {
            displayString: 'TV',
            valueOfInterest: 'Yes',
          },
          SchCVD016: {
            displayString: 'No',
            valueOfInterest: 'No',
          },
        },
      },
    },
    oldPresentationOptions: {
      values: [
        {
          name: 'Yes',
          color: 'green',
          value: 'Yes',
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
      popupHeaderFormat: '{code}: {name}',
    },
    newPresentationOptions: {
      values: [
        {
          name: 'Online',
          color: 'green',
          value: 'SchCVD016c',
        },
        {
          name: 'Radio',
          color: 'teal',
          value: 'SchCVD016b',
        },
        {
          name: 'TV',
          color: 'blue',
          value: 'SchCVD016a',
        },
        {
          name: 'Multiple',
          color: 'purple',
          value: 'Multiple',
        },
        {
          name: 'No',
          color: 'red',
          value: 'SchCVD016',
        },
      ],
      displayType: 'color',
      measureLevel: 'School',
      hideByDefault: {
        null: true,
      },
      displayOnLevel: 'District',
      popupHeaderFormat: '{code}: {name}',
    },
  },
  {
    id: 'Laos_Schools_Students_Follow_MoES_Education_Show',
    oldName: 'Students follow the MoES education shows on TV',
    newName: 'Students follow MoES education programmes at home',
    oldDataElementCode: 'SchCVD017',
    newDataElementCode: 'value',
    oldMeasureBuilder: 'valueForOrgGroup',
    newMeasureBuilder: 'groupData',
    oldMeasureBuilderConfig: {
      entityAggregation: {
        dataSourceEntityType: 'school',
      },
    },
    newMeasureBuilderConfig: {
      groups: {
        Multiple: {
          value: ', ',
          operator: 'regex',
        },
        SchCVD017c: {
          value: 'Online',
          operator: '=',
        },
        SchCVD017b: {
          value: 'Radio',
          operator: '=',
        },
        SchCVD017a: {
          value: 'TV',
          operator: '=',
        },
        SchCVD017: {
          value: 'No',
          operator: '=',
        },
      },
      measureBuilder: 'getStringsFromBinaryData',
      measureBuilderConfig: {
        entityAggregation: {
          dataSourceEntityType: 'school',
        },
        dataElementToString: {
          SchCVD017c: {
            displayString: 'Online',
            valueOfInterest: 'Yes',
          },
          SchCVD017b: {
            displayString: 'Radio',
            valueOfInterest: 'Yes',
          },
          SchCVD017a: {
            displayString: 'TV',
            valueOfInterest: 'Yes',
          },
          SchCVD017: {
            displayString: 'No',
            valueOfInterest: 'No',
          },
        },
      },
    },
    oldPresentationOptions: {
      values: [
        {
          name: 'Yes',
          color: 'green',
          value: 'Yes',
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
      popupHeaderFormat: '{code}: {name}',
    },
    newPresentationOptions: {
      values: [
        {
          name: 'Online',
          color: 'green',
          value: 'SchCVD017c',
        },
        {
          name: 'Radio',
          color: 'teal',
          value: 'SchCVD017b',
        },
        {
          name: 'TV',
          color: 'blue',
          value: 'SchCVD017a',
        },
        {
          name: 'Multiple',
          color: 'purple',
          value: 'Multiple',
        },
        {
          name: 'No',
          color: 'red',
          value: 'SchCVD017',
        },
      ],
      displayType: 'color',
      measureLevel: 'School',
      hideByDefault: {
        null: true,
      },
      displayOnLevel: 'District',
      popupHeaderFormat: '{code}: {name}',
    },
  },
];

exports.up = async function (db) {
  await Promise.all(
    MAP_OVERLAYS.map(overlay => {
      const {
        id,
        newName,
        newDataElementCode,
        newMeasureBuilder,
        newMeasureBuilderConfig,
        newPresentationOptions,
      } = overlay;

      return db.runSql(`
        UPDATE "mapOverlay"
        SET name = '${newName}',
        "dataElementCode" = '${newDataElementCode}',
        "measureBuilder" = '${newMeasureBuilder}',
        "measureBuilderConfig" = '${JSON.stringify(newMeasureBuilderConfig)}',
        "presentationOptions" = '${JSON.stringify(newPresentationOptions)}'
        WHERE id = '${id}';
      `);
    }),
  );
};

exports.down = async function (db) {
  await Promise.all(
    MAP_OVERLAYS.map(overlay => {
      const {
        id,
        oldName,
        oldDataElementCode,
        oldMeasureBuilder,
        oldMeasureBuilderConfig,
        oldPresentationOptions,
      } = overlay;

      return db.runSql(`
        UPDATE "mapOverlay"
        SET name = '${oldName}',
        "dataElementCode" = '${oldDataElementCode}',
        "measureBuilder" = '${oldMeasureBuilder}',
        "measureBuilderConfig" = '${JSON.stringify(oldMeasureBuilderConfig)}',
        "presentationOptions" = '${JSON.stringify(oldPresentationOptions)}'
        WHERE id = '${id}';
      `);
    }),
  );
};

exports._meta = {
  version: 1,
};
