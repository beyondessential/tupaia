/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { expect } from 'chai';
import { it, describe } from 'mocha';
import { calculateBoundsFromEntities } from '../utils/geoJson';

const entities = [
  {
    name: 'Kiribati',
    bounds: {
      coordinates: [
        [
          [-174.743355, -11.646],
          [-174.743355, 4.9],
          [177.0479136, 4.9],
          [177.0479136, -11.646],
          [-174.743355, -11.646],
        ],
      ],
    },
  },
  {
    name: 'Tonga',
    bounds: {
      coordinates: [
        [
          [-179.395198, -24.1625706],
          [-179.395198, -15.3655722],
          [-173.5295458, -15.3655722],
          [-173.5295458, -24.1625706],
          [-179.395198, -24.1625706],
        ],
      ],
    },
  },
];

describe('calculateBoundsFromEntities', () => {
  it('should return the bounds for the entities provided', () => {
    expect(calculateBoundsFromEntities(entities)).to.deep.equal([
      [-24.1625706, 177.04791360000002],
      [4.9, 186.4704542],
    ]);
  });
});
