import { yup } from '@tupaia/utils';
import { DataTableService } from '../DataTableService';
import { DataTableServerModelRegistry } from '../../types';

const requiredParamsSchema = yup.object().shape({
  entityCodes: yup.array().of(yup.string().required()).required(),
  attributes: yup.array().of(yup.string().required()).default([]), // leave empty to get all attributes
});

const configSchema = yup.object();

type Context = { models: DataTableServerModelRegistry };
type EntityAttributes = Record<string, unknown>;

export class EntityAttributesDataTableService extends DataTableService<
  Context,
  typeof requiredParamsSchema,
  typeof configSchema,
  EntityAttributes
> {
  protected supportsAdditionalParams = false;

  public constructor(context: Context, config: unknown) {
    super(context, requiredParamsSchema, configSchema, config);
  }

  protected async pullData(params: { entityCodes: string[]; attributes: string[] }) {
    const { entityCodes, attributes } = params;

    if (entityCodes.length === 0) {
      return [];
    }

    const allEntities = await this.ctx.models.entity.find({ code: entityCodes });

    // After the per-project duplication migration, each shared
    // sub-country code can have multiple `entity` rows — one per project. All
    // copies share identical `attributes` because the duplication INSERT copied
    // them verbatim, so picking the first row per code is safe and avoids the
    // downstream fetchData join fanning rows out by N (one per project copy).
    const seenCodes = new Set<string>();
    const entities = allEntities.filter(entity => {
      if (seenCodes.has(entity.code)) return false;
      seenCodes.add(entity.code);
      return true;
    });

    const rows = [];
    for (const entity of entities) {
      if (attributes.length === 0) {
        rows.push({
          entityCode: entity.code,
          ...entity.attributes,
        });
      } else {
        rows.push({
          entityCode: entity.code,
          ...Object.fromEntries(
            Object.entries(entity.attributes).filter(([key]) => attributes.includes(key)),
          ),
        });
      }
    }
    return rows;
  }
}
