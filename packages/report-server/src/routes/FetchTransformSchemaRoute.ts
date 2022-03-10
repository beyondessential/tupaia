/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { TransformSchema } from '../types';
import { transformSchemas } from '../reportBuilder/transform/functions';
import { aliases } from '../reportBuilder/transform/aliases';

export type FetchTransformSchemaRequest = Request<
  Record<string, never>,
  TransformSchema[],
  Record<string, never>,
  Record<string, never>
>;

export class FetchTransformSchemaRoute extends Route<FetchTransformSchemaRequest> {
  async buildResponse() {
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

    const formattedTransformSchema = Object.entries(transformSchemas).map(
      ([transformKey, config]) => {
        const { fields } = config;
        return {
          code: transformKey,
          schema: {
            properties: {
              transform: { type: 'string', const: transformKey },
              ...removeRedundantConfigs(fields),
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
