/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ajvValidate } from '../../../validation';

const catSchema = {
  description: 'One of the two shapes which {@link ReferenceProps} can take.',
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    age: {
      type: 'number',
    },
  },
  additionalProperties: false,
  required: ['age', 'name'],
};

describe('ajvValidate', () => {
  it('will throw errors for an invalid object', () => {
    expect(() => ajvValidate(catSchema, { age: 'twenty' })).toThrow(
      /must have required property 'name'/,
    );
    expect(() => ajvValidate(catSchema, { age: 'twenty' })).toThrow(/age: must be number/);
  });

  it('will return the object if it is valid', () => {
    const input = {
      age: 1000,
      name: 'Mr Moo',
    };
    const validatedOutput = ajvValidate(catSchema, input);
    expect(validatedOutput).toEqual(input);
  });
});
