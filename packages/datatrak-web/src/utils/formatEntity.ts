// This file is duplicated from entity-server, but reduced to only the functions we need in datatrak-web
import { EntityModel, EntityRecord, ParentFieldsByChildId } from '@tupaia/tsmodels';
import { camelcaseKeys, ResponseObjectBuilder } from '@tupaia/tsutils';
import { Entity, Resolved } from '@tupaia/types';

import { extendedFieldFunctions, isExtendedField } from './extendedFieldFunctions';

export interface AugmentedEntityRecord extends EntityRecord {
  is_recent?: true;
  parent_name?: Entity['name'];
}

export type ExtendedFieldFunctions = Readonly<{
  [field in keyof typeof extendedFieldFunctions]: Resolved<
    ReturnType<(typeof extendedFieldFunctions)[field]>
  >;
}>;

export type ExtendedEntityFieldName = keyof AugmentedEntityRecord | keyof ExtendedFieldFunctions;

export type ExtendedEntityFields = AugmentedEntityRecord & ExtendedFieldFunctions;

export type EntityResponseObject = {
  [field in ExtendedEntityFieldName]: ExtendedEntityFields[field];
};

type FormatContext = { hierarchyId: string };

const BATCHED_PARENT_FIELDS = ['parent_name', 'parent_code'] as const;

type BatchedParentField = (typeof BATCHED_PARENT_FIELDS)[number];

const isBatchedParentField = (field: ExtendedEntityFieldName): field is BatchedParentField =>
  BATCHED_PARENT_FIELDS.includes(field as BatchedParentField);

const getParentFieldsByChildId = async (
  ctx: FormatContext,
  entities: readonly AugmentedEntityRecord[],
): Promise<ParentFieldsByChildId> => {
  if (entities.length === 0) {
    return {};
  }

  const childIds = [...new Set(entities.map(entity => entity.id))];
  const { model } = entities[0] as unknown as { model: EntityModel };
  return model.getParentFieldsByChildIdFromParentChildRelation(ctx.hierarchyId, childIds);
};

export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: AugmentedEntityRecord,
  fields: ExtendedEntityFieldName[],
) {
  const responseBuilder = new ResponseObjectBuilder<EntityResponseObject>();
  for (const field of fields) {
    if (isExtendedField(field)) {
      responseBuilder.set(field, await extendedFieldFunctions[field](entity, ctx));
    } else {
      responseBuilder.set(field, entity[field]);
    }
  }
  return responseBuilder.build();
}

export async function formatEntitiesForResponse(
  ctx: FormatContext,
  entities: readonly AugmentedEntityRecord[],
  fields: readonly ExtendedEntityFieldName[],
) {
  const parentFieldsByChildId = fields.some(isBatchedParentField)
    ? await getParentFieldsByChildId(ctx, entities)
    : {};
  const responseBuilders = new Array(entities.length)
    .fill(0)
    .map(() => new ResponseObjectBuilder<EntityResponseObject>()); // fill array with empty objects
  for (const field of fields) {
    if (isBatchedParentField(field)) {
      entities.forEach((entity, index) =>
        responseBuilders[index].set(field, parentFieldsByChildId[entity.id]?.[field]),
      );
    } else {
      const extendedFieldFunction =
        extendedFieldFunctions[field as keyof typeof extendedFieldFunctions];
      if (!extendedFieldFunction) {
        entities.forEach((entity, index) => responseBuilders[index].set(field, entity[field]));
        continue;
      }

      await Promise.all(
        entities.map(async (entity, index) => {
          responseBuilders[index].set(field, await extendedFieldFunction(entity, ctx));
        }),
      );
    }
  }
  const response = responseBuilders.map(builder => builder.build());
  return camelcaseKeys(response);
}
