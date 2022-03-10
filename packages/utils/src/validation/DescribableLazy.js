/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import Lazy from 'yup/lib/Lazy';

export class DescribableLazy extends Lazy {
  constructor(builder, yupSchemas) {
    super(builder);
    this.yupSchemas = yupSchemas;
  }

  describe() {
    // Convert yup schema to json schema
    const schemas = [];
    schemas.push(...this.yupSchemas.map(yupSchema => yupSchema.describe()));
    const convertedSchema = schemas.map(schema => {
      const { oneOf, type, innerType } = schema;
      if (oneOf.length > 0) {
        return {
          enum: oneOf,
        };
      }
      if (type === 'array' && innerType && innerType.oneOf.length > 0) {
        return {
          type,
          items: { enum: innerType.oneOf },
        };
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
