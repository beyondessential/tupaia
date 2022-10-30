/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { ReportServerAggregator } from '../../../aggregator';
import { buildOutput } from '../../../reportBuilder/output';
import { TransformTable } from '../../../reportBuilder/transform';
import { MULTIPLE_TRANSFORMED_DATA } from './output.fixtures';

describe('rows', () => {
  const dataBroker = { context: {} };
  const aggregator = new Aggregator(dataBroker);

  it('returns the rows of the table', async () => {
    const table = TransformTable.fromRows(MULTIPLE_TRANSFORMED_DATA);
    const expectedData = table.getRows();
    const config = {
      type: 'rows',
    };
    const context = {};
    const reportServerAggregator = new ReportServerAggregator(aggregator);
    const output = buildOutput(config, context, reportServerAggregator);

    const results = await output(table);
    expect(results).toEqual(expectedData);
  });
});
