/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Initial states for app
 * initialOrgUnit as world.
 * initial project as explore.
 */

export const initialOrgUnit = {
  type: 'World',
  organisationUnitCode: 'World',
  name: 'World',
  parent: {},
  location: {
    type: 'no-coordinates',
    coordinates: '',
    bounds: [
      [6.5, 149],
      [-30, 204.5],
    ],
  },
};

export const INITIAL_PROJECT_CODE = 'explore';
export const INITIAL_MEASURE_ID = '126,171'; // 'Operational Facilities'
