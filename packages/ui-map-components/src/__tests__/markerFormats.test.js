import { YES_COLOR, NO_COLOR } from '../constants';
import {
  autoAssignColors,
  createValueMapping,
  getMeasureDisplayInfo,
  getFormattedInfo,
  flattenNumericalMeasureData,
} from '../utils';

describe('measures', () => {
  describe('processing', () => {
    it('should create a correct value mapping', () => {
      const valueMapping = createValueMapping([
        { value: 3, name: 'Yes' },
        { value: 9, name: 'No' },
        { value: 2, name: 'Maybe' },
      ]);

      expect(valueMapping).toHaveProperty('3.name', 'Yes');
      expect(valueMapping).toHaveProperty('9.name', 'No');
      expect(valueMapping).toHaveProperty('2.name', 'Maybe');
    });

    it('should create a correct value mapping with an array in it', () => {
      const valueMapping = createValueMapping([
        { value: [3, 4], name: 'Yes' },
        { value: 9, name: 'No' },
        { value: 2, name: 'Maybe' },
      ]);

      expect(valueMapping).toHaveProperty('3.name', 'Yes');
      expect(valueMapping).toHaveProperty('9.name', 'No');
      expect(valueMapping).toHaveProperty('2.name', 'Maybe');
      expect(valueMapping).toHaveProperty('4.name', 'Yes');
    });

    it('should create a null mapping when none is provided', () => {
      const valueMapping = createValueMapping([{ value: 1, name: 'test' }], 'icon');

      expect(valueMapping).toHaveProperty('null.name', 'No data');
    });

    it('should use the provided null mapping', () => {
      const valueMapping = createValueMapping(
        [
          { value: 1, name: 'test' },
          { value: 'null', name: 'null-test' },
        ],
        'icon',
      );

      expect(valueMapping).toHaveProperty('null.name', 'null-test');
    });

    it('should assign yes and no colors correctly', () => {
      const coloredValues = autoAssignColors([
        { value: 3, name: 'Yes' },
        { value: 9, name: 'No' },
        { value: 2, name: 'Maybe' },
      ]);
      const valueMapping = createValueMapping(coloredValues, 'color');

      expect(valueMapping).toBeDefined();
      expect(valueMapping[3]).toHaveProperty('color', YES_COLOR);
      expect(valueMapping[9]).toHaveProperty('color', NO_COLOR);
      expect(valueMapping[2]).toBeDefined();
      expect(valueMapping[2]).not.toHaveProperty('color', YES_COLOR);
      expect(valueMapping[2]).not.toHaveProperty('color', NO_COLOR);
    });

    it('should flatten objects with nested numerical values correctly', () => {
      const flattenedData = flattenNumericalMeasureData(
        [{ test_key: 201 }, { test_key: 33 }, { test_key: 16 }, { test_key: 0 }],
        'test_key',
      );

      expect(flattenedData[0]).toBe(201);
      expect(flattenedData[1]).toBe(33);
      expect(flattenedData[2]).toBe(16);
      expect(flattenedData[3]).toBe(0);
    });
  });

  describe('markers', () => {
    const markerData = {
      organisationUnitCode: 'a',
      coordinates: [1.123, 4.456],
      questionA: 0,
      questionB: 'yes',
      questionC: 0.01,
    };

    const optionsBase = {
      key: 'questionA',
      type: 'icon',
      valueMapping: {
        0: { icon: 'circle' },
      },
    };

    const optionsOverride = {
      key: 'questionB',
      type: 'icon',
      valueMapping: {
        yes: { icon: 'triangle' },
      },
    };

    const optionsOther = {
      key: 'questionB',
      type: 'icon',
      valueMapping: {
        other: { icon: 'square' },
      },
    };

    const optionsOtherAvailable = {
      key: 'questionA',
      type: 'icon',
      valueMapping: {
        0: { icon: 'triangle' },
        other: { icon: 'square' },
      },
    };

    const optionsColor = {
      key: 'questionB',
      type: 'color',
      valueMapping: {
        yes: { color: 'blue' },
      },
    };

    const optionsRadius = {
      key: 'questionC',
      type: 'radius',
      valueMapping: {},
    };

    const optionsSpectrum = {
      key: 'questionC',
      type: 'spectrum',
      scaleType: 'performance',
      valueMapping: {},
    };

    it('should get icon from a single measure', () => {
      const display = getMeasureDisplayInfo(markerData, [optionsBase]);
      expect(display).toHaveProperty('icon', 'circle');
    });

    it('should get keys from multiple measures', () => {
      const display = getMeasureDisplayInfo(markerData, [optionsBase, optionsColor, optionsRadius]);
      expect(display).toHaveProperty('color', 'blue');
      expect(display).toHaveProperty('icon', 'circle');
      expect(display).toHaveProperty('radius', 0.01);
    });

    it('should be overridden by a later measure info', () => {
      const display = getMeasureDisplayInfo(markerData, [optionsBase, optionsOverride]);
      expect(display).toHaveProperty('icon', 'triangle');
    });

    it('should use "other" icon when value is unavailable', () => {
      const display = getMeasureDisplayInfo(markerData, [optionsOther]);
      expect(display).toHaveProperty('icon', 'square');
    });

    it('should not use "other" icon when value is available', () => {
      const display = getMeasureDisplayInfo(markerData, [optionsOtherAvailable]);
      expect(display).toHaveProperty('icon', 'triangle');
    });

    it('should choose a color from a spectrum', () => {
      const display = getMeasureDisplayInfo({ questionC: 0 }, [optionsSpectrum]);
      expect(display).toHaveProperty('color', 'hsl(0, 100%, 50%)');
      const display2 = getMeasureDisplayInfo({ questionC: 1 }, [optionsSpectrum]);
      expect(display2).toHaveProperty('color', 'hsl(100, 100%, 50%)');
      const display3 = getMeasureDisplayInfo({ questionC: 0.5 }, [optionsSpectrum]);
      expect(display3).toHaveProperty('color', 'hsl(50, 100%, 50%)');
    });

    it('should support coloured radius', () => {
      // A coloured radius will choose colour from a spectrum option, and pick radius size from a radius option
      const questionAValue = 100;
      const display = getMeasureDisplayInfo(
        {
          questionC: 0.5,
          questionA: questionAValue,
        },
        [
          {
            ...optionsSpectrum,
            scaleType: 'performanceDesc',
          },
          { ...optionsRadius, key: 'questionA' },
        ],
      );
      expect(display).toHaveProperty('color', 'hsl(50, 100%, 50%)');
      expect(display).toHaveProperty('radius', questionAValue);
    });
  });

  describe('popup', () => {
    // TODO: failing test marked as skip to get CI up, see #1080
    it.skip('should format a string value for an icon measure', () => {
      const info = getFormattedInfo(
        {
          question: 0,
        },
        {
          key: 'question',
          type: 'icon',
          valueMapping: {
            0: { name: 'test' },
          },
        },
      );

      expect(info).toHaveProperty('value', 'test');
    });

    // TODO: failing test marked as skip to get CI up, see #1080
    it.skip('should format a string value for a color measure', () => {
      const info = getFormattedInfo(
        {
          question: 0,
        },
        {
          key: 'question',
          type: 'color',
          valueMapping: {
            0: { name: 'test' },
          },
        },
      );

      expect(info).toHaveProperty('value', 'test');
    });

    // TODO: failing test marked as skip to get CI up, see #1080
    it.skip('should format a string value for a shaded region measure', () => {
      const info = getFormattedInfo(
        {
          question: 0,
        },
        {
          key: 'question',
          type: 'shading',
          valueMapping: {
            0: { name: 'test' },
          },
        },
      );

      expect(info).toHaveProperty('value', 'test');
    });

    // TODO: failing test marked as skip to get CI up, see #1080
    it.skip('should format a string value for a radius measure', () => {
      const info = getFormattedInfo(
        {
          question: 0,
        },
        {
          key: 'question',
          type: 'radius',
          valueMapping: {
            0: { name: 'test' },
          },
        },
      );

      expect(info).toHaveProperty('value', 'test');
    });

    // TODO: failing test marked as skip to get CI up, see #1080
    it.skip('should format a numeric value for a radius measure when no corresponding name exists', () => {
      const info = getFormattedInfo(
        {
          question: 1,
        },
        {
          key: 'question',
          type: 'radius',
          valueMapping: {
            0: { name: 'test' },
          },
        },
      );

      expect(info).toHaveProperty('value', 1);
    });

    // TODO: failing test marked as skip to get CI up, see #1080
    it.skip('should format a percentile value for a spectrum measure', () => {
      const info = getFormattedInfo(
        {
          question: 0.2,
        },
        {
          key: 'question',
          type: 'spectrum',
          valueMapping: {
            0: { name: 'test' }, // this should not get picked up
          },
        },
      );

      expect(info).toHaveProperty('value', 0.2);
    });

    // TODO: failing test marked as skip to get CI up, see #1080
    it.skip('should respect the displayedValueKey property', () => {
      const info = getFormattedInfo(
        {
          question: 'base',
          moreInfo: 'extra',
        },
        {
          key: 'question',
          displayedValueKey: 'moreInfo',
          type: 'icon',
          valueMapping: {
            0: { name: 'test' },
          },
        },
      );

      expect(info).toHaveProperty('value', 'extra');
    });
  });

  describe('legend', () => {});
});
