/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MULTIPLE_ANALYTICS } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('transform', () => {
  it('throws an error for an unknown transform', () => {
    expect(() =>
      buildTransform([
        {
          transform: 'flyToTheMoon',
          insert: {
            '=$row.dataElement': '$row.value',
          },
          exclude: '*',
        },
      ]),
    ).toThrow();
  });

  it('can perform transforms in a row', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          '=$row.dataElement': '$row.value',
        },
        exclude: '*',
      },
      {
        transform: 'groupRows',
        mergeUsing: { BCD1: 'sum' },
      },
      {
        transform: 'updateColumns',
        insert: {
          Total: '$row.BCD1',
        },
        exclude: '*',
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([{ Total: 11 }]);
  });

  it('supports title and description in transforms', () => {
    const transform = buildTransform([
      {
        title: 'Key value by data element',
        description: 'Add a column for each data element name, useful for aggregating later on',
        transform: 'updateColumns',
        insert: {
          '=$row.dataElement': '$row.value',
        },
        exclude: '*',
      },
      {
        title: 'Sum BCD1',
        description: 'Group all rows together and sum their values for BCD1',
        transform: 'groupRows',
        mergeUsing: { BCD1: 'sum' },
      },
      {
        title: 'Add Total column',
        description: 'Add a column called Total whose value is the same as BCD1',
        transform: 'updateColumns',
        insert: {
          Total: '$row.BCD1',
        },
        exclude: '*',
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([{ Total: 11 }]);
  });
});
