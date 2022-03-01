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
    const formattedTransformSchema = Object.entries(transformSchemas).map(
      ([transformKey, config]) => {
        const { fields } = config;
        return {
          name: transformKey,
          code: transformKey,
          schema: {
            properties: {
              ...fields,
            },
          },
        };
      },
    );

    const formattedAliasesSchema = Object.entries(aliases).map(([aliasesKey]) => {
      return {
        name: aliasesKey,
        code: aliasesKey,
        alias: true,
      };
    });

    return [...formattedTransformSchema, ...formattedAliasesSchema];
  }
}
