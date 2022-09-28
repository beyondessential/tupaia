/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { createApp } from '/app';
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

describe.skip('UserHasAccess', () => {
  let app;

  beforeAll(async () => {
    app = new TestableApp(await createApp());
    app.mockSessionUserJson('Test user', 'testuser@test.com', accessPolicy);
  });

  it('should have access to some root level Demo Land organisation units', async () => {
    const userResponse = await app.get('getUser');
    expect(userResponse.body.email).toBe('testuser@test.com');
    const demolandResponse = await app.get('organisationUnit?organisationUnitCode=DL');
    const { organisationUnitChildren } = demolandResponse.body;
    const childCodes = organisationUnitChildren.map(child => child.organisationUnitCode);
    expect(childCodes).toInclude('DL_North');
    expect(childCodes).toInclude('DL_South East');
    expect(childCodes).not.toInclude('DL_South West');
  });

  it('should not have access to Demo Land organisation units specified as public access false', async () => {
    const southWestResponse = await app.get(
      'organisationUnit?organisationUnitCode=DL_South%20West',
    );
    expect(southWestResponse.statusCode).toBe(401);

    const slytherinResponse = await app.get(
      'organisationUnit?organisationUnitCode=DL_North_Slytherin',
    );
    expect(slytherinResponse.statusCode).toBe(401);

    const dl7Response = await app.get('organisationUnit?organisationUnitCode=DL_7');
    expect(dl7Response.statusCode).toBe(401);
  });

  it('should only retrieve public level dashboards for Tonga org units unless Access Policy otherwise specifies', async () => {
    const tongaDashboardResponse = await app.get(
      'dashboard?organisationUnitCode=TO&projectCode=explore',
    );
    expect(tongaDashboardResponse.statusCode).toBe(200);
    expect(Object.keys(tongaDashboardResponse.body)).toInclude('General');
    expect(Object.keys(tongaDashboardResponse.body)).not.toInclude('PEHS');

    const niuasDashboardResponse = await app.get(
      'dashboard?organisationUnitCode=TO_Niuas&projectCode=explore',
    );
    expect(niuasDashboardResponse.statusCode).toBe(200);
    expect(Object.keys(niuasDashboardResponse.body)).toInclude('General');
    expect(niuasDashboardResponse.body).to.not.have.any.keys('PEHS');

    const tongatapuDashboardResponse = await app.get(
      'dashboard?organisationUnitCode=TO_Tongatapu&projectCode=explore',
    );
    expect(tongatapuDashboardResponse.statusCode).toBe(200);
    expect(Object.keys(tongatapuDashboardResponse.body)).toStrictEqual(
      expect.arrayContaining(['General', 'PEHS']),
    );
  });

  it('should not have access to donor level measure group for top-level Tonga organisation unit', async () => {
    const tongaDashboardResponse = await app.get('measures?organisationUnitCode=TO');
    expect(tongaDashboardResponse.statusCode).toBe(200);

    expect(tongaDashboardResponse.body.measures).not.toHaveProperty('Facility equipment');
  });

  it('should not have access to donor level measure group for organisation unit that does not have any donor level permissions', async () => {
    const niuasDashboardResponse = await app.get(
      'measures?organisationUnitCode=TO_Niuas&projectCode=explore',
    );
    expect(niuasDashboardResponse.statusCode).toBe(200);
    expect(niuasDashboardResponse.body.measures).not.toHaveProperty('Facility equipment');
  });

  it('should have access to donor level measure group for nested organisation unit with donor level permissions', async () => {
    const tongaDashboardResponse = await app.get(
      'measures?organisationUnitCode=TO_Tongatapu&projectCode=explore',
    );
    expect(tongaDashboardResponse.statusCode).toBe(200);

    expect(tongaDashboardResponse.body.measures).toHaveProperty('Facility equipment');
    expect(tongaDashboardResponse.body.measures['Facility equipment']).toMatchObject({
      measureId: 1,
      name: 'Adult weighing scale',
    });
  });

  it('should reveal public level measure data', async () => {
    const measureDataResponse = await app.get('measureData?organisationUnitCode=TO&measureId=126');
    expect(measureDataResponse.statusCode).toBe(200);

    expect(measureDataResponse.body.displayType).toBe('dot');
    expect(measureDataResponse.body.measureId).toBe(126);
    expect(measureDataResponse.body.measureOptions).toMatchObject({ name: 'open', value: '0' });
  });

  it('should not reveal donor level measure data for organisation units that the user does not have access to', async () => {
    const restrictedMeasureDataResponse = await app.get(
      'measureData?organisationUnitCode=TO&measureId=7',
    );
    expect(restrictedMeasureDataResponse.statusCode).toBe(401);
  });

  it('should reveal donor level measure data for organisation units that the user has access to', async () => {
    const measureDataResponse = await app.get(
      'measureData?organisationUnitCode=TO_Tongatapu&measureId=7',
    );
    expect(measureDataResponse.statusCode).toBe(200);
  });
});
