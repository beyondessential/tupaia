import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { AccessPolicy } from '@tupaia/access-policy';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../../permissions';
import { assertCanImportEntities } from '../../../../apiV2/import/importEntities/assertCanImportEntities';

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
    const countryNames = ['Kiribati'];

    const result = await assertCanImportEntities(accessPolicy, countryNames);
    expect(result).to.true;
  });

  it('Sufficient permissions: Should allow importing entities within multiple country if users have access to all the countries that the entities are within', async () => {
    const countryNames = ['Kiribati', 'Solomon Islands'];

    const result = await assertCanImportEntities(accessPolicy, countryNames);
    expect(result).to.true;
  });

  it('Insufficient permissions: Should not allow import entities within 1 country if users do not have access to the country that the entities are within', async () => {
    const countryNames = ['Laos', 'Vanuatu'];

    expect(() => assertCanImportEntities(accessPolicy, countryNames)).to.throw;
  });
});
