/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';
import { transform } from '../reportBuilder/transform';

const reports = [
  {
    id: 'TO_HPU_Nutrition_Counselling_Total_Sessions_Conducted',
    config: {
      fetch: [
        { fetchAnalytics: { codes: ['HP299a', 'HP323a'], aggregationType: 'FINAL_EACH_MONTH' } },
      ],
      filter: [],
      transform: [
        { select: { value: '<value>', as: '<dataElement>' } },
        { drop: 'dataElement' },
        { drop: 'value' },
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
        { select: { value: '<Total Nutritional Counselling Sessions Conducted>', as: '<name>' } },
        {
          mergeRows: {
            group: ['organisationUnit'],
            drop: ['Total Nutritional Counselling Sessions Conducted', 'name'],
          },
        },
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
            codes: ['CH324', 'CH325', 'CH326', 'CH327', 'CH328', 'CH329'],
            aggregationType: 'RAW',
          },
        },
      ],
      filter: [],
      transform: [
        { select: { value: '<value>', as: '<dataElement>' } },
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
    id: 'TO_HPU_NCD_Risk_Factory_Screening_Type_Setting_Unique',
    config: {},
  },
];

class FetchReportRouteHandler {
  constructor() {
    this.aggregator = createAggregator(Aggregator);
  }

  fetchReport = async (req, res) => {
    const { models, params, query } = req;
    const { reportId } = params;
    const { organisationUnitCode, dashboardId, period, projectCode } = query;
    const report = reports.find(report => report.id === reportId);
    const { codes: dataElementCodes, aggregationType } = report.config.fetch[0].fetchAnalytics;
    console.log(dataElementCodes, aggregationType);
    const data = await this.aggregator.fetchAnalytics(
      dataElementCodes,
      {
        dataServices: [
          {
            isDataRegional: false,
          },
        ],
        organisationUnitCodes: [organisationUnitCode],
      },
      {},
      {
        aggregationType,
      },
    );
    data.results = transform(data.results, report.config.transform);
    respond(res, data.results);
  };
}

export const fetchReport = new FetchReportRouteHandler().fetchReport;
