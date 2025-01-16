import { TupaiaApiClient } from '@tupaia/api-client';
import { yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';

const requiredParamsSchema = yup.object().shape({
  hierarchy: yup.string().default('explore'),
  entityCodes: yup.array().of(yup.string().required()).required(),
  filter: yup.object(),
  fields: yup.array().of(yup.string().required()).default(['code']),
  includeDescendants: yup.boolean().default(false),
});

const configSchema = yup.object();

type EntitiesDataTableContext = { apiClient: TupaiaApiClient };
type Entity = Record<string, unknown>;

/**
 * DataTableService for pulling data entityApi.getEntities() and entityApi.getDescendantsOfEntities()
 */
export class EntitiesDataTableService extends DataTableService<
  EntitiesDataTableContext,
  typeof requiredParamsSchema,
  typeof configSchema,
  Entity
> {
  protected supportsAdditionalParams = false;

  public constructor(context: EntitiesDataTableContext, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected async pullData(params: {
    hierarchy: string;
    entityCodes: string[];
    filter?: Record<string, unknown>;
    fields: string[];
    includeDescendants: boolean;
  }) {
    const { hierarchy, entityCodes, filter, fields, includeDescendants } = params;

    const entities = await this.ctx.apiClient.entity.getEntities(hierarchy, entityCodes, {
      fields,
      filter,
    });

    if (!includeDescendants) {
      return entities;
    }

    const descendants = await this.ctx.apiClient.entity.getDescendantsOfEntities(
      hierarchy,
      entityCodes,
      {
        fields,
        filter,
      },
    );

    return entities.concat(descendants);
  }
}
