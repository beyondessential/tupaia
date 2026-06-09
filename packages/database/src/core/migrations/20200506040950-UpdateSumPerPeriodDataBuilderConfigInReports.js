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

// These are the reports that use multiple dataBuilders and 1 of them is sumPerPeriod
const COVID_Compose_Cumulative_Deaths_Vs_Cases_REPORT_ID =
  'COVID_Compose_Cumulative_Deaths_Vs_Cases';
const COVID_Compose_Daily_Deaths_Vs_Cases_REPORT_ID = 'COVID_Compose_Daily_Deaths_Vs_Cases';
const PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations_REPORT_ID =
  'PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations';
const PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations_REPORT_ID =
  'PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations';

const COVID_Compose_Cumulative_Deaths_Vs_Cases_UPDATE_INFO = {
  OLD_DATA_BUILDER_CONFIG: {
    dataBuilders: {
      cases: {
        dataBuilder: 'sumAllPreviousPerDay',
        dataBuilderConfig: {
          dataSource: {
            type: 'single',
            codes: ['dailysurvey003'],
          },
        },
      },
      deaths: {
        dataBuilder: 'sumAllPreviousPerDay',
        dataBuilderConfig: {
          dataSource: {
            type: 'single',
            codes: ['dailysurvey004'],
          },
        },
      },
    },
  },
  NEW_DATA_BUILDER_CONFIG: {
    dataBuilders: {
      cases: {
        dataBuilder: 'sumAllPreviousPerDay',
        dataBuilderConfig: {
          dataClasses: {
            value: {
              codes: ['dailysurvey003'],
            },
          },
        },
      },
      deaths: {
        dataBuilder: 'sumAllPreviousPerDay',
        dataBuilderConfig: {
          dataClasses: {
            value: {
              codes: ['dailysurvey004'],
            },
          },
        },
      },
    },
  },
};

const COVID_Compose_Daily_Deaths_Vs_Cases_REPORT_ID_UPDATE_INFO = {
  OLD_DATA_BUILDER_CONFIG: {
    dataBuilders: {
      cases: {
        dataBuilder: 'sumPerDay',
        dataBuilderConfig: {
          dataSource: {
            type: 'single',
            codes: ['dailysurvey003'],
          },
        },
      },
      deaths: {
        dataBuilder: 'sumPerDay',
        dataBuilderConfig: {
          dataSource: {
            type: 'single',
            codes: ['dailysurvey004'],
          },
        },
      },
    },
  },
  NEW_DATA_BUILDER_CONFIG: {
    dataBuilders: {
      cases: {
        dataBuilder: 'sumPerDay',
        dataBuilderConfig: {
          dataClasses: {
            value: {
              codes: ['dailysurvey003'],
            },
          },
        },
      },
      deaths: {
        dataBuilder: 'sumPerDay',
        dataBuilderConfig: {
          dataClasses: {
            value: {
              codes: ['dailysurvey004'],
            },
          },
        },
      },
    },
  },
};

const PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations_UPDATE_INFO = {
  OLD_DATA_BUILDER_CONFIG: {
    percentages: {
      value: {
        numerator: 'mrdtPositive',
        denominator: 'consultations',
      },
    },
    dataBuilders: {
      mrdtPositive: {
        dataBuilder: 'sumPerWeek',
        dataBuilderConfig: {
          dataSource: {
            type: 'single',
            codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'],
          },
        },
      },
      consultations: {
        dataBuilder: 'sumPerWeek',
        dataBuilderConfig: {
          dataSource: {
            type: 'single',
            codes: ['SSWT1001'],
          },
        },
      },
    },
  },
  NEW_DATA_BUILDER_CONFIG: {
    percentages: {
      value: {
        numerator: 'mrdtPositive',
        denominator: 'consultations',
      },
    },
    dataBuilders: {
      mrdtPositive: {
        dataBuilder: 'sumPerWeek',
        dataBuilderConfig: {
          dataClasses: {
            value: {
              codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'],
            },
          },
        },
      },
      consultations: {
        dataBuilder: 'sumPerWeek',
        dataBuilderConfig: {
          dataClasses: {
            value: {
              codes: ['SSWT1001'],
            },
          },
        },
      },
    },
  },
};

const PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations_UPDATE_INFO = {
  OLD_DATA_BUILDER_CONFIG: {
    dataBuilders: {
      positive: {
        dataBuilder: 'composePercentagesPerPeriod',
        dataBuilderConfig: {
          percentages: {
            value: {
              numerator: 'positiveCount',
              denominator: 'consultationCount',
            },
          },
          dataBuilders: {
            positiveCount: {
              dataBuilder: 'sumPerWeek',
              dataBuilderConfig: {
                dataSource: {
                  type: 'single',
                  codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'],
                },
              },
            },
            consultationCount: {
              dataBuilder: 'sumPerWeek',
              dataBuilderConfig: {
                dataSource: {
                  type: 'single',
                  codes: ['SSWT1072'],
                },
              },
            },
          },
        },
      },
      consultations: {
        dataBuilder: 'sumPerWeek',
        dataBuilderConfig: {
          dataSource: {
            type: 'single',
            codes: ['SSWT1001'],
          },
        },
      },
    },
  },
  NEW_DATA_BUILDER_CONFIG: {
    dataBuilders: {
      positive: {
        dataBuilder: 'composePercentagesPerPeriod',
        dataBuilderConfig: {
          percentages: {
            value: {
              numerator: 'positiveCount',
              denominator: 'consultationCount',
            },
          },
          dataBuilders: {
            positiveCount: {
              dataBuilder: 'sumPerWeek',
              dataBuilderConfig: {
                dataClasses: {
                  value: {
                    codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'],
                  },
                },
              },
            },
            consultationCount: {
              dataBuilder: 'sumPerWeek',
              dataBuilderConfig: {
                dataClasses: {
                  value: {
                    codes: ['SSWT1072'],
                  },
                },
              },
            },
          },
        },
      },
      consultations: {
        dataBuilder: 'sumPerWeek',
        dataBuilderConfig: {
          dataClasses: {
            value: {
              codes: ['SSWT1001'],
            },
          },
        },
      },
    },
  },
};

const updateReportDataBuilderConfig = async (db, reportId, dataBuilderConfig) => {
  await db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '${JSON.stringify(dataBuilderConfig)}'
    WHERE id = '${reportId}';
  `);
};

exports.up = async function (db) {
  await updateReportDataBuilderConfig(
    db,
    COVID_Compose_Cumulative_Deaths_Vs_Cases_REPORT_ID,
    COVID_Compose_Cumulative_Deaths_Vs_Cases_UPDATE_INFO.NEW_DATA_BUILDER_CONFIG,
  );
  await updateReportDataBuilderConfig(
    db,
    COVID_Compose_Daily_Deaths_Vs_Cases_REPORT_ID,
    COVID_Compose_Daily_Deaths_Vs_Cases_REPORT_ID_UPDATE_INFO.NEW_DATA_BUILDER_CONFIG,
  );
  await updateReportDataBuilderConfig(
    db,
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations_REPORT_ID,
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations_UPDATE_INFO.NEW_DATA_BUILDER_CONFIG,
  );
  await updateReportDataBuilderConfig(
    db,
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations_REPORT_ID,
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations_UPDATE_INFO.NEW_DATA_BUILDER_CONFIG,
  );
};

exports.down = async function (db) {
  await updateReportDataBuilderConfig(
    db,
    COVID_Compose_Cumulative_Deaths_Vs_Cases_REPORT_ID,
    COVID_Compose_Cumulative_Deaths_Vs_Cases_UPDATE_INFO.OLD_DATA_BUILDER_CONFIG,
  );
  await updateReportDataBuilderConfig(
    db,
    COVID_Compose_Daily_Deaths_Vs_Cases_REPORT_ID,
    COVID_Compose_Daily_Deaths_Vs_Cases_REPORT_ID_UPDATE_INFO.OLD_DATA_BUILDER_CONFIG,
  );
  await updateReportDataBuilderConfig(
    db,
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations_REPORT_ID,
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations_UPDATE_INFO.OLD_DATA_BUILDER_CONFIG,
  );
  await updateReportDataBuilderConfig(
    db,
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations_REPORT_ID,
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations_UPDATE_INFO.OLD_DATA_BUILDER_CONFIG,
  );
};

exports._meta = {
  version: 1,
};
