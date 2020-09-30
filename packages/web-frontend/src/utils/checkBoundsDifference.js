/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

export default function (orgUnitBounds, currentBounds) {
  const orgUnitLatDifference = orgUnitBounds[1][0] - orgUnitBounds[0][0];
  const orgUnitLonDifference = orgUnitBounds[1][1] - orgUnitBounds[0][1];
  const currentLatDifference = currentBounds.getNorthEast().lat - currentBounds.getSouthWest().lat;
  const currentLonDifference = currentBounds.getNorthEast().lng - currentBounds.getSouthWest().lng;

  const latDifferencePercentage =
    currentLatDifference / (currentLatDifference + orgUnitLatDifference);
  const lonDifferencePercentage =
    currentLonDifference / (currentLonDifference + orgUnitLonDifference);

  return latDifferencePercentage > lonDifferencePercentage
    ? lonDifferencePercentage
    : latDifferencePercentage;
}
