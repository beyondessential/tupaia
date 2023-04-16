/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
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

const removeRedundantConfigs = (fields: Record<string, any | any[]> | any[]) => {
  if (typeof fields !== 'object' || Array.isArray(fields)) {
    return fields;
  }
  const updatedFields = { ...fields };
  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value === 'object') {
      updatedFields[key] = removeRedundantConfigs(value);
    }
    const isEmptyArray = Array.isArray(value) && value.length === 0;
    if (isEmptyArray) {
      delete updatedFields[key];
    }
  });
  return updatedFields;
};

const formatYupSchema = (yupSchema: yup.AnyObjectSchema) => {
  const { fields } = yupSchema.describe();
  const schema = Object.fromEntries(
    Object.entries(fields).map(([field, description]) => {
      const formattedDescription = removeRedundantConfigs(description);
      // 'getDefault' is not supported on lazy schemas
      if (yupSchema.fields[field].getDefault) {
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
