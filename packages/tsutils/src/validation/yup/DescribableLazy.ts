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
export class DescribableLazy<Schema extends AnySchema<any, any, any>> extends Lazy<Schema, any> {
  private readonly yupSchemas: Schema[];

  public constructor(builder: LazyBuilder<Schema>, yupSchemas: Array<Schema>) {
    super(builder);
    this.yupSchemas = yupSchemas;
  }

  public describe() {
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

type ExactMatch<T, Matcher> = T extends Matcher ? (Matcher extends T ? T : never) : never;

export const describableLazy = <
  TypesInBuilder extends AnySchema<any, any, any>,
  TypesInArray extends AnySchema<any, any, any>
>(
  builder: LazyBuilder<ExactMatch<TypesInBuilder, TypesInArray>>,
  yupSchemas: Array<ExactMatch<TypesInArray, TypesInBuilder>>,
) => {
  return new DescribableLazy(builder, yupSchemas as TypesInBuilder[]);
};
