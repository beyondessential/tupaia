/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MULTIPLE_ANALYTICS } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('transform', () => {
  it('can perform transforms in a row', () => {
    const transform = buildTransform([
      {
        transform: 'select',
        '$row.dataElement': '$row.value',
      },
      {
        transform: 'aggregate',
        BCD1: 'sum',
      },
      {
        transform: 'select',
        "'Total'": '$row.BCD1',
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([{ Total: 11 }]);
  });

  it('supports title and description in transforms', () => {
    const transform = buildTransform([
      {
        $title: 'Key value by data element',
        $description: 'Add a column for each data element name, useful for aggregating later on',
        transform: 'select',
        '$row.dataElement': '$row.value',
      },
      {
        $title: 'Sum BCD1',
        $description: 'Group all rows together and sum their values for BCD1',
        transform: 'aggregate',
        BCD1: 'sum',
      },
      {
        $title: 'Add Total column',
        $description: 'Add a column called Total whose value is the same as BCD1',
        transform: 'select',
        "'Total'": '$row.BCD1',
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([{ Total: 11 }]);
  });
});
