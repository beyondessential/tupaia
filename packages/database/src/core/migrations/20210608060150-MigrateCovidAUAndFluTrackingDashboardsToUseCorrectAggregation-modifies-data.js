'use strict';

var dbm;
var type;
var seed;

const updateDashboardConfig = (db, dashboardId, dataBuilderConfig) => {
  return db.runSql(`
    UPDATE legacy_report 
    SET data_builder_config = '${JSON.stringify(dataBuilderConfig)}'
    where code = '${dashboardId}';
  `);
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const DASHBOARD_CONFIGS = {
  COVID_AU_Total_Cases_Each_State_Per_Day: {
    commonConfig: {
      includeTotal: 'true',
      dataElementCodes: ['dailysurvey003'],
      entityAggregation: {
        dataSourceEntityType: 'district',
      },
    },
    newConfig: {
      aggregations: [
        {
          type: 'FINAL_EACH_DAY',
        },
        {
          type: 'SUM_PREVIOUS_EACH_DAY',
        },
      ],
    },
  },
  COVID_Total_Cases_By_State: {
    commonConfig: {
      labels: {
        AU_Tasmania: 'TAS',
        AU_Victoria: 'VIC',
        AU_Queensland: 'QLD',
        'AU_New South Wales': 'NSW',
        'AU_South Australia': 'SA',
        'AU_Western Australia': 'WA',
        'AU_Northern Territory': 'NT',
        'AU_Australian Capital Territory': 'ACT',
      },
      dataElementCodes: ['dailysurvey003'],
      entityAggregation: {
        dataSourceEntityType: 'district',
      },
    },
    newConfig: {
      aggregations: [{ type: 'FINAL_EACH_DAY' }, { type: 'SUM' }],
    },
    oldConfig: {
      aggregationType: 'SUM',
    },
  },
  COVID_Compose_Cumulative_Deaths_Vs_Cases: {
    newConfig: {
      dataBuilders: {
        cases: {
          dataBuilder: 'sumPerPeriod',
          dataBuilderConfig: {
            dataClasses: {
              value: {
                codes: ['dailysurvey003'],
              },
            },
            aggregations: [{ type: 'FINAL_EACH_DAY' }, { type: 'SUM_PREVIOUS_EACH_DAY' }],
            entityAggregation: {
              dataSourceEntityType: 'district',
            },
          },
        },
        deaths: {
          dataBuilder: 'sumPerPeriod',
          dataBuilderConfig: {
            dataClasses: {
              value: {
                codes: ['dailysurvey004'],
              },
            },
            aggregations: [{ type: 'FINAL_EACH_DAY' }, { type: 'SUM_PREVIOUS_EACH_DAY' }],
            entityAggregation: {
              dataSourceEntityType: 'district',
            },
          },
        },
      },
    },
    oldConfig: {
      dataBuilders: {
        cases: {
          dataBuilder: 'sumPerPeriod',
          dataBuilderConfig: {
            dataClasses: {
              value: {
                codes: ['dailysurvey003'],
              },
            },
            aggregationType: 'SUM_PREVIOUS_EACH_DAY',
            entityAggregation: {
              dataSourceEntityType: 'district',
            },
          },
        },
        deaths: {
          dataBuilder: 'sumPerPeriod',
          dataBuilderConfig: {
            dataClasses: {
              value: {
                codes: ['dailysurvey004'],
              },
            },
            aggregationType: 'SUM_PREVIOUS_EACH_DAY',
            entityAggregation: {
              dataSourceEntityType: 'district',
            },
          },
        },
      },
    },
  },
  COVID_Total_Cases_By_Type: {
    commonConfig: {
      labels: {
        dailysurvey003: 'Total confirmed cases',
        dailysurvey004: 'Total deaths',
      },
      dataElementCodes: ['dailysurvey003', 'dailysurvey004'],
      entityAggregation: {
        dataSourceEntityType: 'district',
      },
    },
    newConfig: {
      aggregations: [{ type: 'FINAL_EACH_DAY' }, { type: 'SUM' }],
    },
  },
  COVID_Total_Tests_Conducted: {
    commonConfig: {
      labels: {
        dailysurvey006: 'Total tests conducted',
      },
      dataElementCodes: ['dailysurvey006'],
      entityAggregation: {
        dataSourceEntityType: 'district',
      },
    },
    newConfig: {
      aggregations: [{ type: 'FINAL_EACH_DAY' }, { type: 'SUM' }],
    },
  },
};

exports.up = async function (db) {
  return Promise.all(
    Object.entries(DASHBOARD_CONFIGS).map(async ([dashboardId, { commonConfig, newConfig }]) =>
      updateDashboardConfig(db, dashboardId, {
        ...commonConfig,
        ...newConfig,
      }),
    ),
  );
};

exports.down = async function (db) {
  return Promise.all(
    Object.entries(DASHBOARD_CONFIGS).map(async ([dashboardId, { commonConfig, oldConfig }]) =>
      updateDashboardConfig(db, dashboardId, {
        ...commonConfig,
        ...oldConfig,
      }),
    ),
  );
};

exports._meta = {
  version: 1,
};
