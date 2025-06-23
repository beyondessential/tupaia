import { getHeatmapColor, getReverseHeatmapColor } from '../utils';

describe('getHeatmapColorByOrder()', () => {
  it('getHeatmapColor() should return expected rgb', () => {
    const value = (Math.random() * 10).toFixed(1);
    let expectedRgb = null;
    if (value < 0.15) expectedRgb = 'rgb(255, 255, 204)';
    else if (value >= 0.15 && value < 0.25) expectedRgb = 'rgb(255, 237, 160)';
    else if (value >= 0.25 && value < 0.35) expectedRgb = 'rgb(254, 217, 118)';
    else if (value >= 0.35 && value < 0.45) expectedRgb = 'rgb(254, 178, 76)';
    else if (value >= 0.45 && value < 0.55) expectedRgb = 'rgb(253, 141, 60)';
    else if (value >= 0.55 && value < 0.65) expectedRgb = 'rgb(252, 78, 42)';
    else if (value >= 0.65 && value < 0.75) expectedRgb = 'rgb(227, 26, 28)';
    else if (value >= 0.75 && value < 0.85) expectedRgb = 'rgb(118, 0, 38)';
    else if (value >= 0.85) expectedRgb = 'rgb(128, 0, 38)';

    expect(getHeatmapColor(value)).toEqual(expectedRgb);
  });

  it('getReverseHeatmapColor() should return expected rgb', () => {
    const value = (Math.random() * 10).toFixed(1);
    let expectedRgb = null;
    if (value < 0.15) expectedRgb = 'rgb(128, 0, 38)';
    else if (value >= 0.15 && value < 0.25) expectedRgb = 'rgb(118, 0, 38)';
    else if (value >= 0.25 && value < 0.35) expectedRgb = 'rgb(227, 26, 28)';
    else if (value >= 0.35 && value < 0.45) expectedRgb = 'rgb(252, 78, 42)';
    else if (value >= 0.45 && value < 0.55) expectedRgb = 'rgb(253, 141, 60)';
    else if (value >= 0.55 && value < 0.65) expectedRgb = 'rgb(254, 178, 76)';
    else if (value >= 0.65 && value < 0.75) expectedRgb = 'rgb(254, 217, 118)';
    else if (value >= 0.75 && value < 0.85) expectedRgb = 'rgb(255, 237, 160)';
    else if (value >= 0.85) expectedRgb = 'rgb(255, 255, 204)';

    expect(getReverseHeatmapColor(value)).toEqual(expectedRgb);
  });
});
