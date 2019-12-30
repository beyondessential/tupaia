/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { getModels } from './getModels';

const models = getModels();

describe('UserHasAccess', async function() {
  const user = await models.user.generateInstance();
  user.accessPolicy = {
    permissions: {
      surveys: {
        _items: {
          KI: {
            _access: {
              Admin: true,
              Donor: true,
              'Royal Australasian College of Surgeons': true,
            },
          },
          DL: {
            _access: {
              Public: true,
            },
          },
        },
      },
      reports: {
        _items: {
          DL: {
            _access: {
              Public: true,
            },
          },
          TO: {
            _access: {
              Public: true,
            },
            _items: {
              TO_Niuas: {
                _access: {
                  Admin: true,
                  Public: false,
                  Donor: true,
                  'Royal Australasian College of Surgeons': true,
                },
              },
            },
          },
        },
      },
    },
  };

  it('should have access to public Demo Land surveys', async () => {
    const hasAccess = await user.hasAccess('surveys', ['DL'], 'Public');
    expect(hasAccess).to.equal(true);
  });

  it('should have access to Kiribati surveys with admin permission group', async () => {
    const hasAccess = await user.hasAccess('surveys', ['KI'], 'Admin');
    expect(hasAccess).to.equal(true);
  });

  it('should not have access to No_Permissions surveys without a permission group', async () => {
    const hasAccess = await user.hasAccess('surveys', ['No_Permissions']);
    expect(hasAccess).to.equal(false);
  });

  it('should not have access to Kiribati surveys with public permission group', async () => {
    const hasAccess = await user.hasAccess('surveys', ['KI'], 'Public');
    expect(hasAccess).to.equal(false);
  });

  it('should not have access to surveys without a country', async () => {
    const hasAccess = await user.hasAccess('surveys');
    expect(hasAccess).to.equal(false);
  });

  it('should be able to access a report in any Demo Land region with Public permissions', async () => {
    const hasAccess = await user.hasAccess('reports', ['DL', 'DL_Frankston'], 'Public');
    expect(hasAccess).to.equal(true);
  });

  it('should be able to access a report in any Tonga region without a permission group', async () => {
    const hasAccess = await user.hasAccess('reports', ['TO', 'TO_Other']);
    expect(hasAccess).to.equal(true);
  });

  it('should be able to access a report in any Tonga region with a permission group', async () => {
    const hasAccess = await user.hasAccess('reports', ['TO', 'TO_Other'], 'Public');
    expect(hasAccess).to.equal(true);
  });

  it('should be able to access a report in Tonga Niuas region with admin permission group', async () => {
    const hasAccess = await user.hasAccess('reports', ['TO', 'TO_Niuas'], 'Admin');
    expect(hasAccess).to.equal(true);
  });

  it('should be able to access a report in a Tonga Niuas subregion with admin permission group', async () => {
    const hasAccess = await user.hasAccess('reports', ['TO', 'TO_Niuas', 'TO_Subregion'], 'Admin');
    expect(hasAccess).to.equal(true);
  });

  it('should not be able to access a report in Tonga Niuas region with public permission group', async () => {
    const hasAccess = await user.hasAccess('reports', ['TO', 'TO_Niuas'], 'Public');
    expect(hasAccess).to.equal(false);
  });

  it('should be able to access a report in Tonga other region with public permission group', async () => {
    const hasAccess = await user.hasAccess('reports', ['TO', 'TO_Other'], 'Public');
    expect(hasAccess).to.equal(true);
  });

  it('should not be able to access a report in TT region without a permission group', async () => {
    const hasAccess = await user.hasAccess('reports', ['TT', 'TT_Region']);
    expect(hasAccess).to.equal(false);
  });

  it('should not be able to access a report in a TT subregion without a permission group', async () => {
    const hasAccess = await user.hasAccess('reports', ['TT', 'TT_Region', 'TT_Subregion']);
    expect(hasAccess).to.equal(false);
  });

  it('should not be able to access a report in a Tonga Niuas subregion with public permission group', async () => {
    const hasAccess = await user.hasAccess('reports', ['TO', 'TO_Niuas', 'TO_Subregion'], 'Public');
    expect(hasAccess).to.equal(false);
  });
});
