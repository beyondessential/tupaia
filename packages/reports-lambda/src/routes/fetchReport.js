/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';
import { fetch, transform } from '../reportBuilder';

const reports = [
  {
    id: 'TO_HPU_Nutrition_Counselling_Total_Sessions_Conducted',
    config: {
      fetch: [
        {
          fetchAnalytics: {
            dataElementCodes: ['HP299a', 'HP323a'],
            aggregationType: 'FINAL_EACH_MONTH',
          },
        },
      ],
      filter: [],
      transform: [
        // Main config
        { select: { convertToPeriod: { period: '<period>', targetType: 'MONTH' }, as: 'period' } },
        { mergeRows: { group: ['period'], sum: ['HP299a'], count: ['HP323a'] } },
        {
          select: {
            add: ['<HP299a>', '<HP323a>'],
            as: 'Total Nutritional Counselling Sessions Conducted',
          },
        },
        { drop: 'HP299a' },
        { drop: 'HP323a' },
        // { select: { periodToTimestamp: { period: '<period>' }, as: 'timestamp' } },
        {
          select: {
            periodToDisplayString: { period: '<period>', targetType: 'MONTH' },
            as: 'name',
          },
        },
        { drop: 'period' },

        //Test config
        // { select: { value: '<Total Nutritional Counselling Sessions Conducted>', as: '<name>' } },
        // {
        //   mergeRows: {
        //     group: ['organisationUnit'],
        //     drop: ['Total Nutritional Counselling Sessions Conducted', 'name'],
        //   },
        // },
      ],
      output: [
        {
          dimensions: [
            'organisationUnit',
            'name',
            'timestamp',
            'Total Nutritional Counselling Sessions Conducted',
          ],
        },
      ],
    },
  },
  {
    id: 'TO_CH_Descriptive_ClinicDressings',
    config: {
      fetch: [
        {
          fetchAnalytics: {
            dataElementCodes: ['CH324', 'CH325', 'CH326', 'CH327', 'CH328', 'CH329'],
            aggregationType: 'RAW',
          },
        },
      ],
      filter: [],
      transform: [
        // {
        //   mergeRows: {
        //     sum: ['CH324', 'CH325', 'CH326', 'CH327', 'CH328', 'CH329'],
        //     drop: ['dataElement', 'value', 'period', 'organisationUnit'],
        //   },
        // },
        {
          mergeRows: {
            count: ['period'],
          },
        },
        {
          select: {
            add: ['<CH324>', '<CH325>'],
            as: 'Total',
          },
        },
        // Main config
      ],
      output: [
        {
          dimensions: [
            'organisationUnit',
            'name',
            'timestamp',
            'Total Nutritional Counselling Sessions Conducted',
          ],
        },
      ],
    },
  },
  {
    id: 'TO_HPU_NCD_Risk_Factory_Screening_Type_Setting',
    config: {
      fetch: [
        {
          fetchEvents: {
            programCode: 'HP02',
            dataElementCodes: ['HP31n'],
            entityAggregation: {
              aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
              dataSourceEntityType: 'village',
              aggregationEntityType: 'facility',
            },
            dataServices: [
              {
                isDataRegional: false,
              },
            ],
          },
        },
      ],
      filter: [],
      transform: [
        { drop: 'event' },
        { drop: 'eventDate' },
        { drop: 'orgUnitName' },
        { select: { value: 1, as: '<HP31n>' } },
        { mergeRows: { group: ['orgUnit'], sum: ['<HP31n>'], unique: ['HP31n'] } },
        { select: { value: '<HP31n>', as: 'uniqueSite' } },
        { drop: 'HP3n1' },
        { select: { add: ['<Workplace>', '<Church>', '<Community>', '<School>'], as: 'Total' } },
      ],
      output: [],
    },
  },
  {
    id: 'PG_Strive_PNG_Weekly_Reported_Cases',
    config: {
      fetch: [
        {
          fetchEvents: {
            programCode: 'SCRF',
          },
        },
      ],
      filter: [],
      transform: [],
      output: [],
    },
  },
];

class FetchReportRouteHandler {
  constructor() {
    this.aggregator = createAggregator(Aggregator);
  }

  fetchReport = async (req, res) => {
    const { params, query } = req;
    const { reportId } = params;
    const report = reports.find(reportFromList => reportFromList.id === reportId);
    const data = await fetch(report.config.fetch, this.aggregator, query);
    data.results = transform(data.results, report.config.transform);
    respond(res, data);
  };
}

export const fetchReport = new FetchReportRouteHandler().fetchReport;
