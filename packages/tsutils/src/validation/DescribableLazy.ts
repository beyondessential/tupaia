/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AnySchema, ArraySchema } from 'yup';
import Lazy, { LazyBuilder } from 'yup/lib/Lazy';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// type YupSchemas<T> = AnySchema<T>[];

function validateArraySchema(schema: any): asserts schema is ArraySchema<any> {
  if (!schema || !schema.innerType || !schema.innerType.oneOf) {
    throw new Error(`schema: ${schema} is not an array`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DescribableLazy<T extends AnySchema<any, any, any>> extends Lazy<T, any> {
  yupSchemas: [...T[]];

  constructor(builder: LazyBuilder<T>, yupSchemas: T[]) {
    super(builder);
    const arrayToTuple = <R extends unknown[]>(arrayInput: [...R]) => arrayInput;
    this.yupSchemas = arrayToTuple(yupSchemas);
  }

  describe() {
    // Convert yup schema to json schema
    const schemas = [];
    schemas.push(...this.yupSchemas.map(yupSchema => yupSchema.describe()));
    const convertedSchema = schemas.map(schema => {
      const { oneOf, type } = schema;
      if (oneOf.length > 0) {
        return {
          enum: oneOf,
        };
      }

      if (type === 'array') {
        validateArraySchema(schema);
        const { oneOf: arrayOneOf } = schema.innerType;
        if (oneOf.length > 0) {
          return {
            type,
            items: { enum: arrayOneOf },
          };
        }
      }
      return {
        type,
      };
    });

    if (convertedSchema.length === 1) {
      return convertedSchema[0];
    }

    return {
      oneOf: convertedSchema,
    };
  }
}

export const describableLazy = <T extends AnySchema<any, any, any>>(
  builder: LazyBuilder<T>,
  yupSchemas: T[],
) => {
  return new DescribableLazy(builder, yupSchemas);
};
