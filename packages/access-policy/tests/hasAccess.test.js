/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  hasAccess,
  someChildHasAccess, 
  READ_WRITE_ACCESS_LEVEL, 
  READ_ACCESS_LEVEL,
  WRITE_ACCESS_LEVEL 
} from '../';

// quote-props
/* eslint-disable quote-props */
/* eslint-disable quotes */
const accessPolicy = {
  "permissions": {
    "surveys": {
      "_items": {
        "KI": {
          "_access": {
            "Admin": READ_ACCESS_LEVEL,
            "Donor": READ_WRITE_ACCESS_LEVEL,
            "Royal Australasian College of Surgeons": WRITE_ACCESS_LEVEL
          }
        },
        "DL": {
          "_access": {
            "Public": READ_WRITE_ACCESS_LEVEL
          },
          "_items": {
            "DL_Prohibited_Org_Unit": {
              "_access": {
                "Public": false,
              }
            },
            "DL_Available_Org_Unit": {
              "_access": {
                "Public": READ_WRITE_ACCESS_LEVEL,
              }
            },
          },
        },
      }
    },
    "reports": {
      "_items": {
        "DL": {
          "_access": {
            "Public": READ_WRITE_ACCESS_LEVEL
          }
        },
        "TT": {
          "_access": {
            "Admin": false
          },
        },
        "TO": {
          "_access": {
            "Admin": READ_WRITE_ACCESS_LEVEL
          },
          "_items": {
            "TO_Niuas": {
              "_access": {
                "Admin": false,
                "Donor": READ_WRITE_ACCESS_LEVEL,
                "TRH": READ_WRITE_ACCESS_LEVEL,
                "Royal Australasian College of Surgeons": READ_WRITE_ACCESS_LEVEL
              }
            }
          }
        }
      }
    }
  }
};
/* eslint-enable quote-props */
/* eslint-enable quotes */

describe('UserHasAccess', () => {

  it('should have access to public Demo Land surveys', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['DL'], 'Public');
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should not have access to public Demo Land surveys in an organisation unit that has false permissions', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['DL', 'DL_Prohibited_Org_Unit'], 'Public');
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should have access to public Demo Land surveys in an organisation unit that has true Public permissions', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['DL', 'DL_Available_Org_Unit'], 'Public');
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should have access to public Demo Land surveys in an organisation unit that does not have a permission override', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['DL', 'DL_Org_Unit_Not_In_Tree'], 'Public');
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should have access to Kiribati surveys with admin permission group without specifying read/write', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Admin');
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should have access to Kiribati surveys with admin permission group for read', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Admin', READ_ACCESS_LEVEL);
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should not have access to Kiribati surveys with admin permission group for write', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Admin', WRITE_ACCESS_LEVEL);
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should not have access to Kiribati surveys with admin permission group for read/write', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Admin', READ_WRITE_ACCESS_LEVEL);
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should have access to Kiribati surveys with australasian college permission group for write', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Royal Australasian College of Surgeons', WRITE_ACCESS_LEVEL);
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should not have access to Kiribati surveys with australasian college permission group for read', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Royal Australasian College of Surgeons', READ_ACCESS_LEVEL);
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should not have access to Kiribati surveys with australasian college permission group for read/write', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Royal Australasian College of Surgeons', READ_WRITE_ACCESS_LEVEL);
    expect(hasAccessPolicyAccess).to.equal(false);
  });


  it('should have access to Kiribati surveys with donor permission group for read', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Donor', READ_ACCESS_LEVEL);
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should have access to Kiribati surveys with donor permission group for read', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Donor', WRITE_ACCESS_LEVEL);
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should have access to Kiribati surveys with donor permission group for read/write', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Donor', READ_WRITE_ACCESS_LEVEL);
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should not have access to TT surveys without a permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['TT']);
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should not have access to Kiribati surveys with public permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys', ['KI'], 'Public');
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should not have access to surveys without a country', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'surveys');
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should be able to access a report in any Demo Land region with Public permissions', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['DL', 'DL_Frankston'], 'Public');
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should be able to access a report in any Tonga region without a permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['TO', 'TO_Other']);
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should be able to access a report in any Tonga region with a permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['TO', 'TO_Other'], 'Admin');
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should not be able to access a report in Tonga Niuas region with admin permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['TO', 'TO_Niuas'], 'Admin');
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should be able to access a report in a Tonga Niuas subregion with TRH permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['TO', 'TO_Niuas', 'TO_Subregion'], 'TRH');
    expect(hasAccessPolicyAccess).to.equal(true);
  });

  it('should not be able to access a report in a Tonga Niuas subregion with admin permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['TO', 'TO_Niuas', 'TO_Subregion'], 'Admin');
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should not be able to access a report in Tonga Niuas region with public permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['TO', 'TO_Niuas'], 'Public');
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should not be able to access a report in TT region without a permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['TT', 'TT_Region']);
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should not be able to access a report in a TT subregion without a permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['TT', 'TT_Region', 'TT_Subregion']);
    expect(hasAccessPolicyAccess).to.equal(false);
  });

  it('should not be able to access a report in a Tonga Niuas subregion with public permission group', async () => {
    const hasAccessPolicyAccess = hasAccess(accessPolicy, 'reports', ['TO', 'TO_Niuas', 'TO_Subregion'], 'Public');
    expect(hasAccessPolicyAccess).to.equal(false);
  });
});

describe("someChildHasAccess", () => {

  it('should find access where some exists', () => {
    expect(someChildHasAccess(accessPolicy, 'surveys', ['KI'], 'Admin')).to.equal(true);
  });

  it('should not find access where none exists', () => {
    expect(someChildHasAccess(accessPolicy, 'surveys', ['QQ'], 'Admin')).to.equal(false);
  });

  it('should not find access where only non-matching accesses exist', () => {
    expect(someChildHasAccess(accessPolicy, 'surveys', ['DL'], 'Admin')).to.equal(false);
  });

  it('should find access where it only exists deeper in the tree', () => {
    expect(someChildHasAccess(accessPolicy, 'reports', ['TO'], 'Donor')).to.equal(true);
  });

});
