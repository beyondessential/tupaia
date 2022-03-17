/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AnySchema, ArraySchema } from 'yup';
import Lazy, { LazyBuilder } from 'yup/lib/Lazy';

function validateArraySchema(schema: any): asserts schema is ArraySchema<any> {
  if (!schema || !schema.innerType || !schema.innerType.oneOf) {
    throw new Error(`schema: ${schema} is not an array`);
  }
}

// yupSchemas: tuple of Schema type, eg. [StringSchema, NumberSchema]
// builder: LazyBuilder<union of Schema Types>, eg. LazyBuilder<StringSchema | NumberSchema>
// We want the union type to be all the schemas in the tuple
export class DescribableLazy<
  TupleOfSchemas extends [...AnySchema<any, any, any>[]],
  UnionOfSchemas extends TupleOfSchemas[number] = TupleOfSchemas[number]
> extends Lazy<UnionOfSchemas, any> {
  yupSchemas: TupleOfSchemas;

  constructor(builder: LazyBuilder<UnionOfSchemas>, yupSchemas: TupleOfSchemas) {
    super(builder);
    this.yupSchemas = yupSchemas;
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
        if (arrayOneOf.length > 0) {
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

export const describableLazy = <
  ArrayOfSchemas extends AnySchema<any, any, any>[],
  UnionOfSchemas extends ArrayOfSchemas[number] = ArrayOfSchemas[number]
>(
  builder: LazyBuilder<UnionOfSchemas>,
  yupSchemas: [...ArrayOfSchemas],
) => {
  return new DescribableLazy(builder, yupSchemas);
};
