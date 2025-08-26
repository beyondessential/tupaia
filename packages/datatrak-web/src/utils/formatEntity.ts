// This file is duplicated from entity-server, but reduced to only the functions we need in datatrak-web
import { EntityRecord } from '@tupaia/tsmodels';
import { camelcaseKeys, ResponseObjectBuilder } from '@tupaia/tsutils';
import { Entity, Resolved } from '@tupaia/types';

import { extendedFieldFunctions, isExtendedField } from './extendedFieldFunctions';

export type ExtendedFieldFunctions = Readonly<{
  [field in keyof typeof extendedFieldFunctions]: Resolved<
    ReturnType<(typeof extendedFieldFunctions)[field]>
  >;
}>;

export type ExtendedEntityFieldName = keyof Entity | keyof ExtendedFieldFunctions;

export type ExtendedEntityFields = Entity & ExtendedFieldFunctions;
export type EntityResponseObject = {
  [field in ExtendedEntityFieldName]: ExtendedEntityFields[field];
};

type FormatContext = { hierarchyId: string };

export async function formatEntityForResponse(
  ctx: FormatContext,
  entity: EntityRecord,
  fields: ExtendedEntityFieldName[],
) {
  const responseBuilder = new ResponseObjectBuilder<EntityResponseObject>();
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
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
  entities: EntityRecord[],
  fields: ExtendedEntityFieldName[],
) {
  const responseBuilders = new Array(entities.length)
    .fill(0)
    .map(() => new ResponseObjectBuilder<EntityResponseObject>()); // fill array with empty objects
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (isExtendedField(field)) {
      await Promise.all(
        entities.map(async (entity, index) => {
          responseBuilders[index].set(field, await extendedFieldFunctions[field](entity, ctx));
        }),
      );
    } else {
      entities.forEach((entity, index) => responseBuilders[index].set(field, entity[field]));
    }
  }
  const response = responseBuilders.map(builder => builder.build());
  return camelcaseKeys(response);
}
