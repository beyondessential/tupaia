/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

// this value is just pulled from Leaflet examples.
// if we need to anything more complex with z-ordering (ie if there's ever more
// than one constant used here) they should be defined relative to each other,
// and maybe some extra research done into Leaflet to ensure we're not stepping
// on any inbuilt values.
export const MARKER_Z_INDEX = 1000;
