/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildArithmetic } from '../../../builders/buildArithmetic';
import { Indicator } from '../../../types';
import { createAggregator } from '../stubs';
import { ANALYTIC_RESPONSE_FIXTURES, PARAMETER_ANALYTICS } from './buildArithmetic.fixtures';

export const testParameters = () => {
  const aggregator = createAggregator(ANALYTIC_RESPONSE_FIXTURES);
  const api = {
    getAggregator: () => aggregator,
    buildAnalyticsForIndicators: jest.fn(async (indicators: Indicator[]) => {
      const indicatorCodes = indicators.map(i => i.code);
      return PARAMETER_ANALYTICS.filter(a => indicatorCodes.includes(a.dataElement));
    }),
  };
  const PARAMETERS = {
    Positive_Cases: {
      code: '_Positive_Cases',
      builder: 'testAnalyticCount',
      config: {
        formula: "Result = 'Positive'",
        aggregation: 'FINAL_EACH_WEEK',
      },
    },
    Total_Consultations: {
      code: '_Total_Consultations',
      builder: 'testArithmetic',
      config: {
        formula: 'Male_Consultations + Female_Consultations',
        aggregation: 'FINAL_EACH_WEEK',
      },
    },
  };
  const fetchOptions = { organisationUnitCodes: ['TO'] };

  it('formula consists of parameters', async () => {
    const parameters = [PARAMETERS.Positive_Cases, PARAMETERS.Total_Consultations];
    const config = {
      formula: '_Positive_Cases / _Total_Consultations',
      parameters,
      aggregation: {},
    };

    await expect(buildArithmetic({ api, config, fetchOptions })).resolves.toIncludeSameMembers([
      { organisationUnit: 'TO', period: '2019', value: 0.4 },
      { organisationUnit: 'TO', period: '2020', value: 0.3 },
    ]);
    expect(api.buildAnalyticsForIndicators).toHaveBeenCalledOnceWith(parameters, fetchOptions);
    expect(aggregator.fetchAnalytics).not.toHaveBeenCalled();
  });

  it('formula consists of parameters and data sources', async () => {
    const parameters = [PARAMETERS.Positive_Cases];
    const config = {
      formula: '_Positive_Cases / Population',
      parameters,
      aggregation: 'FINAL_EACH_YEAR',
    };

    await expect(buildArithmetic({ api, config, fetchOptions })).resolves.toIncludeSameMembers([
      { organisationUnit: 'TO', period: '2019', value: 0.1 },
      { organisationUnit: 'TO', period: '2020', value: 0.2 },
    ]);
    expect(api.buildAnalyticsForIndicators).toHaveBeenCalledOnceWith(parameters, fetchOptions);
    expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
      ['Population'],
      expect.anything(),
      expect.anything(),
    );
  });
};
