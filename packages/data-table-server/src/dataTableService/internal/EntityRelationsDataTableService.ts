/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';
import { yupSchemaToDataTableParams } from '../utils';

const paramsSchema = yup.object().shape({
  hierarchy: yup.string().default('explore'),
  entityCodes: yup.array().of(yup.string().required()).required(),
  ancestorType: yup.string().required(),
  descendantType: yup.string().required(),
});

const configSchema = yup.object();

type EntityRelationsDataTableContext = { apiClient: TupaiaApiClient };
type EntityRelation = { ancestor: string; descendant: string };

/**
 * DataTableService for pulling data entityApi.getRelations()
 */
export class EntityRelationsDataTableService extends DataTableService<
  EntityRelationsDataTableContext,
  typeof paramsSchema,
  typeof configSchema,
  EntityRelation
> {
  public constructor(context: EntityRelationsDataTableContext, config: unknown) {
    super(context, paramsSchema, configSchema, config);
  }

  protected async pullData(params: {
    hierarchy: string;
    entityCodes: string[];
    ancestorType: string;
    descendantType: string;
  }) {
    const { hierarchy, entityCodes, ancestorType, descendantType } = params;
    const relations = await this.ctx.apiClient.entity.getRelationshipsOfEntities(
      hierarchy,
      entityCodes,
      'descendant',
      {},
      { filter: { type: ancestorType } },
      { filter: { type: descendantType } },
    );

    return Object.entries(relations).map(([descendant, ancestor]) => ({
      ancestor,
      descendant,
    })) as EntityRelation[];
  }

  public getParameters() {
    const { hierarchy, entityCodes, ancestorType, descendantType } = yupSchemaToDataTableParams(
      paramsSchema,
    );

    return [
      { name: 'hierarchy', config: hierarchy },
      {
        name: 'entityCodes',
        config: entityCodes,
      },
      { name: 'ancestorType', config: ancestorType },
      {
        name: 'descendantType',
        config: descendantType,
      },
    ];
  }
}
