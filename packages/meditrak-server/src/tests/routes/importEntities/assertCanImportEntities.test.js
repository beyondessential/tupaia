/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { assertCanImportEntities } from '../../../routes/importEntities/assertCanImportEntities';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  LA: ['Admin'],
};

describe('assertCanImportEntities(): Permissions checker for Importing Entities', async () => {
  const accessPolicy = new AccessPolicy(DEFAULT_POLICY);

  it('Sufficient permissions: Should allow importing entities within 1 country if users have access to the country that the entities are within', async () => {
    const entitiesByCountryName = {
      Kiribati: [
        {
          code: 'KI_1',
          name: 'Kiribati test entity 1',
        },
        {
          code: 'KI_2',
          name: 'Kiribati test entity 2',
        },
        {
          code: 'KI_3',
          name: 'Kiribati test entity 3',
        },
      ],
    };

    const result = await assertCanImportEntities(accessPolicy, entitiesByCountryName);
    expect(result).to.true;
  });

  it('Sufficient permissions: Should allow importing entities within multiple country if users have access to all the countries that the entities are within', async () => {
    const entitiesByCountryName = {
      Kiribati: [
        {
          code: 'KI_1',
          name: 'Kiribati test entity 1',
        },
        {
          code: 'KI_2',
          name: 'Kiribati test entity 2',
        },
        {
          code: 'KI_3',
          name: 'Kiribati test entity 3',
        },
      ],
      'Solomon Islands': [
        {
          code: 'SB_1',
          name: 'Solomon Islands test entity 1',
        },
        {
          code: 'SB_2',
          name: 'Solomon Islands test entity 2',
        },
        {
          code: 'SB_3',
          name: 'Solomon Islands test entity 3',
        },
      ],
    };

    const result = await assertCanImportEntities(accessPolicy, entitiesByCountryName);
    expect(result).to.true;
  });

  it('Insufficient permissions: Should not allow import entities within 1 country if users do not have access to the country that the entities are within', async () => {
    const entitiesByCountryName = {
      Laos: [
        {
          code: 'LA_1',
          name: 'Laos test entity 1',
        },
        {
          code: 'LA_2',
          name: 'Laos test entity 2',
        },
        {
          code: 'LA_3',
          name: 'Laos test entity 3',
        },
      ],
      Vanuatu: [
        {
          code: 'VU_1',
          name: 'Vanuatu test entity 1',
        },
        {
          code: 'VU_2',
          name: 'Vanuatu test entity 2',
        },
        {
          code: 'VU_3',
          name: 'Vanuatu test entity 3',
        },
      ],
    };

    expect(() => assertCanImportEntities(accessPolicy, entitiesByCountryName)).to.throw;
  });
});
