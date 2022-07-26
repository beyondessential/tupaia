/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { createModelsStub } from '../../testUtilities';

describe('createModelsStub', () => {
  const mockModels = createModelsStub({
    horses: {
      records: [
        {
          name: 'Rufio',
          color: 'blue',
          config: {
            mane: 'luxurious',
          },
        },
        {
          name: 'Billy',
          color: 'blue',
          config: {
            mane: 'enchanting',
          },
        },
        {
          name: 'Zane',
          color: 'purple',
          config: {},
        },
      ],
    },
  });

  it('can find()', async () => {
    const results = await mockModels.horses.find({ color: 'purple' });
    expect(results.length).to.equal(1);
    expect(results[0].name).to.equal('Zane');
  });

  it('can findOne()', async () => {
    const result = await mockModels.horses.findOne({ color: 'blue' });
    expect(result.name).to.equal('Rufio'); // first in order
  });

  it('supports array value', async () => {
    const results = await mockModels.horses.find({ name: ['Rufio', 'Billy'] });
    expect(results.length).to.equal(2);
  });

  it('supports ->> keys', async () => {
    const results = await mockModels.horses.find({ 'config->>mane': 'enchanting' });
    expect(results.length).to.equal(1);
    expect(results[0].name).to.equal('Billy');
  });

  it('supports ->> keys as array', async () => {
    const results = await mockModels.horses.find({ 'config->>mane': ['enchanting', 'luxurious'] });
    expect(results.length).to.equal(2);
  });
});
