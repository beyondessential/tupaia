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
        '$.row.dataElement': '$.row.value',
      },
      {
        transform: 'aggregate',
        BCD1: 'sum',
      },
      ,
      {
        transform: 'select',
        "'Total'": '$.row.BCD1',
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([{ Total: 11 }]);
  });
});
