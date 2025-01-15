import { TupaiaApiClient } from '@tupaia/api-client';
import { yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';

const requiredParamsSchema = yup.object().shape({
  hierarchy: yup.string().default('explore'),
  entityCodes: yup.array().of(yup.string().required()).required(),
  ancestorType: yup.string(),
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
  typeof requiredParamsSchema,
  typeof configSchema,
  EntityRelation
> {
  protected supportsAdditionalParams = false;

  public constructor(context: EntityRelationsDataTableContext, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected async pullData(params: {
    hierarchy: string;
    entityCodes: string[];
    ancestorType?: string;
    descendantType: string;
  }) {
    const { hierarchy, entityCodes, ancestorType, descendantType } = params;
    const relations = await this.ctx.apiClient.entity.getRelationshipsOfEntities(
      hierarchy,
      entityCodes,
      'descendant',
      {},
      ancestorType ? { filter: { type: ancestorType } } : undefined,
      { filter: { type: descendantType } },
    );

    return Object.entries(relations).map(([descendant, ancestor]) => ({
      ancestor,
      descendant,
    })) as EntityRelation[];
  }
}
