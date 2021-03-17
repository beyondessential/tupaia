/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { getHeatmapColor, getReverseHeatmapColor } from '../utils';

describe('getHeatmapColorByOrder()', () => {
  it('getHeatmapColor() should return expected rgb', () => {
    const value = (Math.random() * 10).toFixed(1);
    let expectedRgb = [];
    if (value < 0.15) expectedRgb = [255, 255, 204];
    else if (value >= 0.15 && value < 0.25) expectedRgb = [255, 237, 160];
    else if (value >= 0.25 && value < 0.35) expectedRgb = [254, 217, 118];
    else if (value >= 0.35 && value < 0.45) expectedRgb = [254, 178, 76];
    else if (value >= 0.45 && value < 0.55) expectedRgb = [253, 141, 60];
    else if (value >= 0.55 && value < 0.65) expectedRgb = [252, 78, 42];
    else if (value >= 0.65 && value < 0.75) expectedRgb = [227, 26, 28];
    else if (value >= 0.75 && value < 0.85) expectedRgb = [118, 0, 38];
    else if (value >= 0.85) expectedRgb = [128, 0, 38];

    expect(getHeatmapColor(value)).toEqual(
      `rgb(${expectedRgb[0]},${expectedRgb[1]},${expectedRgb[2]})`,
    );
  });

  it('getReverseHeatmapColor() should return expected rgb', () => {
    const value = (Math.random() * 10).toFixed(1);
    let expectedRgb = [];
    if (value < 0.15) expectedRgb = [128, 0, 38];
    else if (value >= 0.15 && value < 0.25) expectedRgb = [118, 0, 38];
    else if (value >= 0.25 && value < 0.35) expectedRgb = [227, 26, 28];
    else if (value >= 0.35 && value < 0.45) expectedRgb = [252, 78, 42];
    else if (value >= 0.45 && value < 0.55) expectedRgb = [253, 141, 60];
    else if (value >= 0.55 && value < 0.65) expectedRgb = [254, 178, 76];
    else if (value >= 0.65 && value < 0.75) expectedRgb = [254, 217, 118];
    else if (value >= 0.75 && value < 0.85) expectedRgb = [255, 237, 160];
    else if (value >= 0.85) expectedRgb = [255, 255, 204];

    expect(getReverseHeatmapColor(value)).toEqual(
      `rgb(${expectedRgb[0]},${expectedRgb[1]},${expectedRgb[2]})`,
    );
  });
});
