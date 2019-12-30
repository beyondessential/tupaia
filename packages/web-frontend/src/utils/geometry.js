/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

export function arePositionsEqual(a, b) {
  if (a && b) {
    // if both centers are defined, equal if the position matches
    return a[0] === b[0] && a[1] === b[1];
  }
  // if either are not defined, equal only if both are not defined
  return a === b;
}

export function areBoundsEqual(a, b) {
  if (a && b) {
    return arePositionsEqual(a[0], b[0]) && arePositionsEqual(a[1], b[1]);
  }
  // if either are not defined, equal only if both are not defined
  return a === b;
}

export function areBoundsValid(b) {
  return Array.isArray(b) && b.length === 2;
}
