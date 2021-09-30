/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

export const DEFAULT_BOUNDS = [
  // Note: There's a little bit of a hack going on here, the bounds[0] for explore are actually [6.5, 110]
  // However in order to trigger the map to re-render we set them slightly adjusted as [6.5001, 110]
  // See: https://github.com/beyondessential/tupaia-backlog/issues/540#issuecomment-631314721
  [6.5001, 110],
  [-40, 204.5],
];

export const DEFAULT_PROJECT_CODE = 'explore';

export const DEFAULT_MAP_OVERLAY_ID = '126'; // 'Operational Facilities'
