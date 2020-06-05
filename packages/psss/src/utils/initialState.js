/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
export const initialState = {
  auth: {
    status: 'success',
    user: {
      id: '5e729d5a61f76a411c026bd8',
      name: 'Tom Caiger',
      email: 'caigertom@gmail.com',
      verifiedEmail: 'verified',
      permissionGroups: {
        'Demo Land': ['59085f2dfc6a0715dae508e1'],
        'No Country': [
          '59085f2dfc6a0715dae508e3',
          '59085f2dfc6a0715dae508e2',
          '5a7bda4a3ec0d460d21b8141',
          '5b879dd0f013d654c4f226d7',
          '5d003ffcf013d661a6358b76',
          '5d4a1db1f013d6320f2db52e',
          '5dafead861f76a65e69a3eb7',
          '5cef78cbf013d61d7b2af94e',
          '5df31c2361f76a7112c9a6aa',
          '5df6f69b61f76a485cc96d52',
          '5e8a9e2961f76a32a10881c4',
          '59085f2dfc6a0715dae508e1',
          '5b879dd9f013d654c41192fb',
          '5bf21c96f013d60624ba63e2',
          '5bf2233af013d60624122ddc',
          '5ce39de8f013d65dc4ce75bf',
          '5d71b031f013d60c0f24d11d',
          '5ca56d61f013d605ac1e3a32',
        ],
      },
      accessPolicy: {
        permissions: {
          surveys: {
            _items: {
              DL: {
                _access: {
                  Public: true,
                },
              },
              NO: {
                _access: {
                  Admin: true,
                  Donor: true,
                  'Royal Australasian College of Surgeons': true,
                  'Tonga Public Health Heads': true,
                  'Laos IMNCI': true,
                  'Kiribati Facility': true,
                  'Strive PNG Laboratory': true,
                  EPI: true,
                  'STRIVE Super User': true,
                  UNFPA: true,
                  'COVID-19': true,
                  Public: true,
                  'Tonga Reproductive Health': true,
                  'Tonga Community Health': true,
                  'Tonga Health Promotion Unit': true,
                  'mSupply Surveys': true,
                  'Tonga Communicable Diseases': true,
                  'STRIVE User': true,
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
              NO: {
                _access: {
                  Admin: true,
                  Donor: true,
                  'Royal Australasian College of Surgeons': true,
                  'Tonga Public Health Heads': true,
                  'Laos IMNCI': true,
                  'Kiribati Facility': true,
                  'Strive PNG Laboratory': true,
                  EPI: true,
                  'STRIVE Super User': true,
                  UNFPA: true,
                  'COVID-19': true,
                  Public: true,
                  'Tonga Reproductive Health': true,
                  'Tonga Community Health': true,
                  'Tonga Health Promotion Unit': true,
                  'mSupply Surveys': true,
                  'Tonga Communicable Diseases': true,
                  'STRIVE User': true,
                },
              },
            },
          },
        },
      },
    },
    error: null,
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTcyOWQ1YTYxZjc2YTQxMWMwMjZiZDgiLCJyZWZyZXNoVG9rZW4iOiI4SnFYUHVqQlJTSzc4eU9yYjJXY2hydTIyRnVKaTM4WXVuakZNTkJLIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNTkxMzE3Mjg0LCJleHAiOjE1OTEzMTgxODR9.HiT6FB0GOHFvqOt4Rbz6W59NhEkapzCkO5nSqRMqZ94',
    refreshToken: '8JqXPujBRSK78yOrb2Wchru22FuJi38YunjFMNBK',
  },
};
