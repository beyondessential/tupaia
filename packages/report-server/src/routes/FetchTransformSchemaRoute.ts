import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { isEmptyArray } from '@tupaia/tsutils';
import { yup } from '@tupaia/utils';

import { TransformSchema } from '../types';
import { transformSchemas } from '../reportBuilder/transform/functions';
import { aliases } from '../reportBuilder/transform/aliases';

export type FetchTransformSchemaRequest = Request<
  Record<string, never>,
  TransformSchema[],
  Record<string, never>,
  Record<string, never>
>;

const removeRedundantConfigs = (fields: Record<string, any> | any[]) => {
  if (typeof fields !== 'object' || Array.isArray(fields)) {
    return fields;
  }

  const updatedFields: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'object') {
      if (!isEmptyArray(value)) {
        updatedFields[key] = removeRedundantConfigs(value);
      }
    } else {
      updatedFields[key] = value;
    }
  }

  return updatedFields;
};

const formatYupSchema = (yupSchema: yup.AnyObjectSchema) => {
  const { fields } = yupSchema.describe();
  const schema = Object.fromEntries(
    Object.entries(fields).map(([field, description]) => {
      const formattedDescription = removeRedundantConfigs(description);
      // 'getDefault' is not supported on lazy schemas
      if (!Array.isArray(formattedDescription) && yupSchema.fields[field].getDefault) {
        formattedDescription.defaultValue = yupSchema.fields[field].getDefault();
      }
      return [field, formattedDescription];
    }),
  );
  return schema;
};

export class FetchTransformSchemaRoute extends Route<FetchTransformSchemaRequest> {
  public async buildResponse() {
    const formattedTransformSchema = Object.entries(transformSchemas).map(
      ([transformKey, schema]) => {
        const formattedSchema = formatYupSchema(schema);
        return {
          code: transformKey,
          schema: {
            properties: {
              transform: { type: 'string', const: transformKey },
              ...formattedSchema,
            },
          },
        };
      },
    );

    const formattedAliasesSchema = Object.entries(aliases).map(([aliasesKey]) => {
      return {
        code: aliasesKey,
        alias: true,
      };
    });

    return [...formattedTransformSchema, ...formattedAliasesSchema];
  }
}
