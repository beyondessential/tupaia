/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { TestableApp } from './TestableApp';

const accessPolicy = {
  permissions: {
    reports: {
      _items: {
        DL: {
          _access: {
            Public: true,
          },
          _items: {
            DL_North: {
              _access: {
                Admin: true,
                Donor: true,
                'Royal Australasian College of Surgeons': true,
              },
              _items: {
                DL_North_Slytherin: {
                  _access: {
                    Public: false,
                  },
                },
              },
            },
            'DL_South West': {
              _access: {
                Public: false,
              },
            },
            'DL_South East': {
              _items: {
                'DL_South East_Gryffindor': {
                  _items: {
                    DL_3: {
                      _access: {
                        Admin: true,
                        Donor: true,
                        'Royal Australasian College of Surgeons': true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        TO: {
          _access: {
            Public: true,
          },
          _items: {
            TO_Tongatapu: {
              _access: {
                Admin: true,
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

describe('UserHasAccess', function () {
  const app = new TestableApp();
  app.mockSessionUserJson('Test user', 'testuser@test.com', accessPolicy);

  xit('should have access to some root level Demo Land organisation units', async () => {
    const userResponse = await app.get('getUser');
    expect(userResponse.body.email).to.equal('testuser@test.com');

    const demolandResponse = await app.get('organisationUnit?organisationUnitCode=DL');
    const { organisationUnitChildren } = demolandResponse.body;
    const childCodes = organisationUnitChildren.map(child => child.organisationUnitCode);
    expect(childCodes).to.include('DL_North');
    expect(childCodes).to.include('DL_South East');
    expect(childCodes).to.not.include('DL_South West');
  });
  xit('should not have access to Demo Land organisation units specified as public access false', async () => {
    await app.get('organisationUnit?organisationUnitCode=DL_South%20West').expect(401);
    await app.get('organisationUnit?organisationUnitCode=DL_North_Slytherin').expect(401);
    await app.get('organisationUnit?organisationUnitCode=DL_7').expect(401);
  });

  xit('should only retrieve public level dashboards for Tonga org units unless Access Policy otherwise specifies', async () => {
    const tongaDashboardResponse = await app
      .get('dashboard?organisationUnitCode=TO&projectCode=explore')
      .expect(200);
    expect(tongaDashboardResponse.body).to.have.all.keys('General');
    expect(tongaDashboardResponse.body).to.not.have.any.keys('PEHS');

    const niuasDashboardResponse = await app
      .get('dashboard?organisationUnitCode=TO_Niuas&projectCode=explore')
      .expect(200);
    expect(niuasDashboardResponse.body).to.have.all.keys('General');
    expect(niuasDashboardResponse.body).to.not.have.any.keys('PEHS');

    const tongatapuDashboardResponse = await app
      .get('dashboard?organisationUnitCode=TO_Tongatapu&projectCode=explore')
      .expect(200);
    expect(tongatapuDashboardResponse.body).to.have.all.keys('General', 'PEHS');
  });
  xit('should not have access to donor level measure group for top-level Tonga organisation unit', async () => {
    const tongaDashboardResponse = await app.get('measures?organisationUnitCode=TO').expect(200);

    expect(tongaDashboardResponse.body.measures).to.not.have.property('Facility equipment');
  });
  xit('should not have access to donor level measure group for organisation unit that does not have any donor level permissions', async () => {
    const niuasDashboardResponse = await app
      .get('measures?organisationUnitCode=TO_Niuas&projectCode=explore')
      .expect(200);
    expect(niuasDashboardResponse.body.measures).to.not.have.property('Facility equipment');
  });
  xit('should have access to donor level measure group for nested organisation unit with donor level permissions', async () => {
    const tongaDashboardResponse = await app
      .get('measures?organisationUnitCode=TO_Tongatapu&projectCode=explore')
      .expect(200);

    expect(tongaDashboardResponse.body.measures).to.have.property('Facility equipment');
    expect(tongaDashboardResponse.body.measures['Facility equipment']).to.deep.include({
      measureId: 1,
      name: 'Adult weighing scale',
    });
  });
  xit('should reveal public level measure data', async () => {
    const measureDataResponse = await app
      .get('measureData?organisationUnitCode=TO&measureId=126')
      .expect(200);

    expect(measureDataResponse.body.displayType).to.equal('dot');
    expect(measureDataResponse.body.measureId).to.equal(126);
    expect(measureDataResponse.body.measureOptions).to.deep.include({ name: 'open', value: '0' });
  });
  xit('should not reveal donor level measure data for organisation units that the user does not have access to', async () => {
    await app.get('measureData?organisationUnitCode=TO&measureId=7').expect(401);
  });
  xit('should reveal donor level measure data for organisation units that the user has access to', async () => {
    await app.get('measureData?organisationUnitCode=TO_Tongatapu&measureId=7').expect(200);
  });
});
