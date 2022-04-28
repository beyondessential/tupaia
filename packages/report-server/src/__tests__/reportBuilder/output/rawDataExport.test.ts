/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { ReportServerAggregator } from '../../../aggregator';
import { buildOutput } from '../../../reportBuilder/output';
import { MULTIPLE_TRANSFORMED_DATA_FOR_RAW_DATA_EXPORT } from './output.fixtures';

describe('rawDataExport', () => {
  const dataBroker = { context: {} };
  const aggregator = new Aggregator(dataBroker);
  jest.spyOn(aggregator, 'fetchDataGroup').mockImplementation(() => {
    return new Promise(resolve => {
      process.nextTick(() =>
        resolve({
          dataElements: [
            { code: 'dataElement_A', text: 'Laos' },
            { code: 'dataElement_B', text: 'Tonga' },
            { code: 'dataElement_C', text: 'Australia' },
            { code: 'dataElement_D', text: 'New Zealand' },
          ],
        }),
      );
    });
  });

  it('Add the rest of data elements that has no value into columns', async () => {
    const expectedData = {
      columns: [
        {
          key: 'EntityName',
          title: 'EntityName',
        },
        {
          key: 'dataElement_A',
          title: 'Laos',
        },
        {
          key: 'dataElement_B',
          title: 'Tonga',
        },
        {
          key: 'dataElement_C',
          title: 'Australia',
        },
        {
          key: 'dataElement_D',
          title: 'New Zealand',
        },
      ],
      rows: [
        {
          EntityName: 'clinic',
          dataElement_A: 3,
          dataElement_B: 0,
        },
        {
          EntityName: 'hospital',
          dataElement_A: 4,
          dataElement_B: 9,
        },
        {
          EntityName: 'park',
          dataElement_B: 0,
        },
        {
          EntityName: 'others',
          dataElement_B: 5,
        },
      ],
    };
    const reportServerAggregator = new ReportServerAggregator(aggregator);
    const output = buildOutput(
      {
        type: 'rawDataExport',
        dataGroups: ['dataGroupCode'], // required
      },
      reportServerAggregator,
    );

    const results = await output(MULTIPLE_TRANSFORMED_DATA_FOR_RAW_DATA_EXPORT);
    expect(results).toEqual(expectedData);
  });
});
