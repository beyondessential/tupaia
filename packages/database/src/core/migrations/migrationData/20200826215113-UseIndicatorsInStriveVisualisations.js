export const indicators = {
  mrdtPositiveConsultationsWeekly: {
    code: 'MRDT_POS_CONSULT_WEEKLY',
    builder: 'arithmetic',
    config: {
      formula: 'SSWT1021 + SSWT1022 + SSWT1023',
      aggregation: {
        SSWT1021: 'FINAL_EACH_WEEK',
        SSWT1022: 'FINAL_EACH_WEEK',
        SSWT1023: 'FINAL_EACH_WEEK',
      },
      defaultValues: {
        SSWT1021: 0,
        SSWT1022: 0,
        SSWT1023: 0,
      },
    },
  },
  mrdtPositiveConsultationsAgainstTests: {
    code: 'MRDT_POS_CONSULT_AGAINST_TESTS',
    builder: 'arithmetic',
    config: {
      formula: 'MRDT_POS_CONSULT_WEEKLY / SSWT1072',
      aggregation: {
        MRDT_POS_CONSULT_WEEKLY: 'SUM_UNTIL_CURRENT_DAY',
        SSWT1072: ['FINAL_EACH_WEEK', 'SUM_UNTIL_CURRENT_DAY'],
      },
    },
  },
  mrdtPositiveConsultationsAgainstTestsWeekly: {
    code: 'MRDT_POS_CONSULT_AGAINST_TESTS_WEEKLY',
    builder: 'arithmetic',
    config: {
      formula: 'MRDT_POS_CONSULT_WEEKLY / SSWT1072',
      aggregation: {
        MRDT_POS_CONSULT_WEEKLY: 'RAW',
        SSWT1072: 'FINAL_EACH_WEEK',
      },
    },
  },
  mrdtPositiveConsultationsRatioWeekly: {
    code: 'MRDT_POS_CONSULT_RATIO_WEEKLY',
    builder: 'arithmetic',
    config: {
      formula: 'MRDT_POS_CONSULT_WEEKLY / SSWT1001',
      aggregation: {
        MRDT_POS_CONSULT_WEEKLY: 'FINAL_EACH_WEEK',
        SSWT1001: 'FINAL_EACH_WEEK',
      },
    },
  },
};

export const reportChanges = [
  {
    id: 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations',
    new: {
      dataBuilder: 'analytics',
      dataBuilderConfig: {
        dataElementCodes: [indicators.mrdtPositiveConsultationsRatioWeekly.code],
      },
    },
    old: {
      dataBuilder: 'composePercentagesPerPeriod',
      dataBuilderConfig: {
        percentages: {
          value: { numerator: 'mrdtPositive', denominator: 'consultations' },
        },
        dataBuilders: {
          mrdtPositive: {
            dataBuilder: 'sumPerPeriod',
            dataBuilderConfig: {
              dataClasses: { value: { codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'] } },
              aggregationType: 'FINAL_EACH_WEEK',
            },
          },
          consultations: {
            dataBuilder: 'sumPerPeriod',
            dataBuilderConfig: {
              dataClasses: { value: { codes: ['SSWT1001'] } },
              aggregationType: 'FINAL_EACH_WEEK',
            },
          },
        },
      },
    },
  },
  {
    id: 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations',
    new: {
      dataBuilder: 'composeDataPerPeriod',
      dataBuilderConfig: {
        dataBuilders: {
          positive: {
            dataBuilder: 'analyticsPerPeriod',
            dataBuilderConfig: {
              dataElementCode: indicators.mrdtPositiveConsultationsAgainstTestsWeekly.code,
              aggregationType: 'FINAL_EACH_WEEK',
            },
          },
          consultations: {
            dataBuilder: 'analyticsPerPeriod',
            dataBuilderConfig: {
              dataElementCode: 'SSWT1001',
              aggregationType: 'FINAL_EACH_WEEK',
            },
          },
        },
      },
    },
    old: {
      dataBuilder: 'composeDataPerPeriod',
      dataBuilderConfig: {
        dataBuilders: {
          positive: {
            dataBuilder: 'composePercentagesPerPeriod',
            dataBuilderConfig: {
              percentages: {
                value: { numerator: 'positiveCount', denominator: 'consultationCount' },
              },
              dataBuilders: {
                positiveCount: {
                  dataBuilder: 'sumPerPeriod',
                  dataBuilderConfig: {
                    dataClasses: { value: { codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'] } },
                    aggregationType: 'FINAL_EACH_WEEK',
                  },
                },
                consultationCount: {
                  dataBuilder: 'sumPerPeriod',
                  dataBuilderConfig: {
                    dataClasses: { value: { codes: ['SSWT1072'] } },
                    aggregationType: 'FINAL_EACH_WEEK',
                  },
                },
              },
            },
          },
          consultations: {
            dataBuilder: 'sumPerPeriod',
            dataBuilderConfig: {
              dataClasses: { value: { codes: ['SSWT1001'] } },
              aggregationType: 'FINAL_EACH_WEEK',
            },
          },
        },
      },
    },
  },
  {
    id: 'PG_Strive_PNG_RDT_Tests_Total_And_Percent_Positive',
    new: {
      dataBuilder: 'composeDataPerPeriod',
      dataBuilderConfig: {
        dataBuilders: {
          'mRDT Total': {
            dataBuilder: 'analyticsPerPeriod',
            dataBuilderConfig: {
              dataElementCode: 'SSWT1072',
              aggregationType: 'FINAL_EACH_WEEK',
            },
          },
          'mRDT Positive Percentage': {
            dataBuilder: 'analyticsPerPeriod',
            dataBuilderConfig: {
              dataElementCode: indicators.mrdtPositiveConsultationsAgainstTestsWeekly.code,
              aggregationType: 'FINAL_EACH_WEEK',
            },
          },
        },
      },
    },
    old: {
      dataBuilder: 'composeDataPerPeriod',
      dataBuilderConfig: {
        dataBuilders: {
          'mRDT Total': {
            dataBuilder: 'sumPerPeriod',
            dataBuilderConfig: {
              dataClasses: { value: { codes: ['SSWT1072'] } },
              aggregationType: 'FINAL_EACH_WEEK',
            },
          },
          'mRDT Positive Percentage': {
            dataBuilder: 'composePercentagesPerPeriod',
            dataBuilderConfig: {
              percentages: {
                value: { numerator: 'positiveCount', denominator: 'consultationCount' },
              },
              dataBuilders: {
                positiveCount: {
                  dataBuilder: 'sumPerPeriod',
                  dataBuilderConfig: {
                    dataClasses: { value: { codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'] } },
                    aggregationType: 'FINAL_EACH_WEEK',
                  },
                },
                consultationCount: {
                  dataBuilder: 'sumPerPeriod',
                  dataBuilderConfig: {
                    dataClasses: { value: { codes: ['SSWT1072'] } },
                    aggregationType: 'FINAL_EACH_WEEK',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
];
export const overlayChanges = [
  {
    id: 'STRIVE_WTF_Positive',
    new: {
      dataElementCode: indicators.mrdtPositiveConsultationsAgainstTests.code,
      measureBuilder: 'valueForOrgGroup',
      measureBuilderConfig: {},
    },
    old: {
      dataElementCode: 'value',
      measureBuilder: 'composePercentagePerOrgUnit',
      measureBuilderConfig: {
        dataSourceType: 'custom',
        measureBuilders: {
          numerator: {
            measureBuilder: 'sumAllPerOrgUnit',
            measureBuilderConfig: { dataElementCodes: ['SSWT1021', 'SSWT1022', 'SSWT1023'] },
          },
          denominator: {
            measureBuilder: 'sumAllPerOrgUnit',
            measureBuilderConfig: { dataElementCodes: ['SSWT1072'] },
          },
        },
      },
    },
  },
];
