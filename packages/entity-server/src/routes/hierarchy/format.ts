import { EntityRecord } from '@tupaia/server-boilerplate';
import { isNotNullish, ResponseObjectBuilder } from '@tupaia/tsutils';
import { EntityServerModelRegistry } from '../../types';
import {
  ExtendedEntityFieldName,
  FlattableEntityFieldName,
  EntityResponseObject,
  FlattenedEntity,
} from './types';
import { extendedFieldFunctions, isExtendedField } from './extendedFieldFunctions';

type FormatContext = { hierarchyId: string; allowedCountries: string[] };

export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: EntityRecord,
  field: FlattableEntityFieldName,
): Promise<FlattenedEntity>;
export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: EntityRecord,
  fields: ExtendedEntityFieldName[],
): Promise<EntityResponseObject>;
export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: EntityRecord,
  fieldOrFields: FlattableEntityFieldName | ExtendedEntityFieldName[],
): Promise<FlattenedEntity | EntityResponseObject>;
export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: EntityRecord,
  fieldOrFields: FlattableEntityFieldName | ExtendedEntityFieldName[],
) {
  if (!Array.isArray(fieldOrFields)) {
    const field = fieldOrFields;
    if (isNotNullish(field)) return entity[field];
    return undefined;
  }
  const fields = fieldOrFields;
  const responseBuilder = new ResponseObjectBuilder<EntityResponseObject>();
  for (const field of fields) {
    const value = isExtendedField(field)
      ? await extendedFieldFunctions[field](entity, ctx)
      : entity[field];
    responseBuilder.set(field, value);
  }
  return responseBuilder.build();
}

export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: FormatContext,
  entities: EntityRecord[],
  field: FlattableEntityFieldName,
): Promise<FlattenedEntity[]>;
export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: FormatContext,
  entities: EntityRecord[],
  fields: ExtendedEntityFieldName[],
): Promise<EntityResponseObject[]>;
export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: FormatContext,
  entities: EntityRecord[],
  fieldOrFields: FlattableEntityFieldName | ExtendedEntityFieldName[],
): Promise<FlattenedEntity[] | EntityResponseObject[]>;
export async function formatEntitiesForResponse(
  models: EntityServerModelRegistry,
  ctx: FormatContext,
  entities: EntityRecord[],
  fieldOrFields: FlattableEntityFieldName | ExtendedEntityFieldName[],
) {
  if (!Array.isArray(fieldOrFields)) {
    const field = fieldOrFields;
    return Promise.all(entities.map(entity => formatEntityForResponse(ctx, entity, field)));
  }

  const fields = fieldOrFields;
  const { hierarchyId } = ctx;
  const childCodeToParentCode: Record<string, string> = fields.includes('parent_code')
    ? await models.ancestorDescendantRelation.getChildCodeToParentCode(hierarchyId)
    : {};
  const parentCodeToChildCodes: Record<string, string[]> = fields.includes('child_codes')
    ? await models.ancestorDescendantRelation.getParentCodeToChildCodes(hierarchyId)
    : {};

  const responseBuilders = new Array(entities.length)
    .fill(0)
    .map(() => new ResponseObjectBuilder<EntityResponseObject>()); // fill array with empty objects
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (isExtendedField(field)) {
      switch (field) {
        case 'parent_code': {
          entities.forEach((entity, index) =>
            responseBuilders[index].set('parent_code', childCodeToParentCode[entity.code]),
          );
          break;
        }
        case 'child_codes': {
          entities.forEach((entity, index) =>
            responseBuilders[index].set('child_codes', parentCodeToChildCodes[entity.code]),
          );
          break;
        }
        default: {
          await Promise.all(
            entities.map(async (entity, index) => {
              responseBuilders[index].set(field, await extendedFieldFunctions[field](entity, ctx));
            }),
          );
        }
      }
    } else {
      entities.forEach((entity, index) => responseBuilders[index].set(field, entity[field]));
    }
  }
  return responseBuilders.map(builder => builder.build());
}
