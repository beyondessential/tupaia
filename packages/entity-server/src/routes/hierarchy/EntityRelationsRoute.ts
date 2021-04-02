/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType } from '../../models';
import { formatEntitiesForResponse } from './format';
import {
  HierarchyRequest,
  HierarchyRequestParams,
  HierarchyRequestBody,
  HierarchyRequestQuery,
  EntityResponseObject,
  EntityResponse,
  FlattableEntityFields,
  ExtendedEntityFields,
} from './types';

export type RelationsRequest = HierarchyRequest<
  HierarchyRequestParams,
  | (EntityResponseObject & { ancestor: EntityResponse })[] // groupBy: descendant, flat: false
  | (EntityResponseObject & { descendants: EntityResponse[] })[] // groupBy: ancestor, flat: false
  | Record<FlattableEntityFields[keyof FlattableEntityFields], EntityResponse>[] // groupBy: descendant, flat: true
  | Record<FlattableEntityFields[keyof FlattableEntityFields], EntityResponse[]>[], // groupBy: ancestor, flat: true
  HierarchyRequestBody,
  HierarchyRequestQuery & {
    ancestorType?: string;
    descendantType?: string;
    groupBy?: 'ancestor' | 'descendant';
  }
>;

export class EntityRelationsRoute extends Route<RelationsRequest> {
  async buildAncestorCodesAndMap(
    descendants: EntityType[],
    ancestorType: string,
    groupBy: 'ancestor',
  ): Promise<[string[], Record<string, string[]>]>;
  async buildAncestorCodesAndMap(
    descendants: EntityType[],
    ancestorType: string,
    groupBy: 'descendant',
  ): Promise<[string[], Record<string, string>]>;
  async buildAncestorCodesAndMap(
    descendants: EntityType[],
    ancestorType: string,
    groupBy: 'ancestor' | 'descendant',
  ) {
    const { hierarchyId } = this.req.ctx;
    const descendantAncestorMapping = await this.req.models.entity.fetchAncestorDetailsByDescendantCode(
      descendants.map(descendant => descendant.code),
      hierarchyId,
      ancestorType,
    );
    const ancestorCodes = Object.values(descendantAncestorMapping).map(ancestor => ancestor.code);
    const ancestorDescendantPairs = Object.entries(descendantAncestorMapping).map(
      ([descendant, { code: ancestor }]) => ({
        descendant,
        ancestor,
      }),
    );

    if (groupBy === 'ancestor') {
      return [
        ancestorCodes,
        reduceToArrayDictionary(ancestorDescendantPairs, 'ancestor', 'descendant'),
      ];
    }

    return [ancestorCodes, reduceToDictionary(ancestorDescendantPairs, 'descendant', 'ancestor')];
  }

  async getAncestors(ancestorType: string, ancestorsWithDescendantsCodes: string[]) {
    const { entity, hierarchyId, allowedCountries } = this.req.ctx;
    return entity.type === ancestorType
      ? [entity]
      : entity.getDescendants(hierarchyId, {
          code: ancestorsWithDescendantsCodes,
          country_code: allowedCountries,
        });
  }

  async buildFormattedEntitiesByCode(
    entities: EntityType[],
    flat: keyof FlattableEntityFields,
  ): Promise<Record<string, FlattableEntityFields[keyof FlattableEntityFields]>>;
  async buildFormattedEntitiesByCode(
    entities: EntityType[],
    fields: (keyof ExtendedEntityFields)[],
  ): Promise<Record<string, EntityResponseObject>>;
  async buildFormattedEntitiesByCode(
    entities: EntityType[],
    flatOrFields: keyof FlattableEntityFields | (keyof ExtendedEntityFields)[],
  ) {
    const flat = Array.isArray(flatOrFields) ? undefined : flatOrFields;
    const fields = Array.isArray(flatOrFields) ? flatOrFields : [];
    const formattedEntities = flat
      ? await formatEntitiesForResponse(this.req.models, this.req.ctx, entities, flat)
      : await formatEntitiesForResponse(this.req.models, this.req.ctx, entities, fields);
    const formattedEntitiesByCode: Record<string, EntityResponse> = {};
    entities.forEach((unformattedEntity, index) => {
      formattedEntitiesByCode[unformattedEntity.code] = formattedEntities[index];
    });
    return formattedEntitiesByCode;
  }

  async groupByAncestorResponse(
    descendants: EntityType[],
    ancestorType: string,
    fields: (keyof ExtendedEntityFields)[],
  ) {
    const [ancestorCodes, ancestorToDescendants] = await this.buildAncestorCodesAndMap(
      descendants,
      ancestorType,
      'ancestor',
    );

    const ancestors = await this.getAncestors(ancestorType, ancestorCodes);

    const formattedEntitiesByCode = await this.buildFormattedEntitiesByCode(
      [...ancestors, ...descendants],
      fields,
    );
    return ancestors.map(ancestor => ({
      ...formattedEntitiesByCode[ancestor.code],
      descendants: ancestorToDescendants[ancestor.code].map(
        descendantCode => formattedEntitiesByCode[descendantCode],
      ),
    }));
  }

  async flatGroupByAncestorResponse(
    descendants: EntityType[],
    ancestorType: string,
    flat: keyof FlattableEntityFields,
  ) {
    const [ancestorCodes, ancestorToDescendants] = await this.buildAncestorCodesAndMap(
      descendants,
      ancestorType,
      'ancestor',
    );

    if (flat === 'code') {
      return Object.entries(ancestorToDescendants).map(([ancestorCode, descendantCodes]) => ({
        [ancestorCode]: descendantCodes,
      }));
    }

    const ancestors = await this.getAncestors(ancestorType, ancestorCodes);

    const formattedEntitiesByCode = await this.buildFormattedEntitiesByCode(
      [...ancestors, ...descendants],
      flat,
    );
    return ancestors.map(ancestor => ({
      [formattedEntitiesByCode[ancestor.code]]: ancestorToDescendants[ancestor.code].map(
        descendantCode => formattedEntitiesByCode[descendantCode],
      ),
    }));
  }

  async groupByDescendantResponse(
    descendants: EntityType[],
    ancestorType: string,
    fields: (keyof ExtendedEntityFields)[],
  ) {
    const [ancestorCodes, descendantToAncestor] = await this.buildAncestorCodesAndMap(
      descendants,
      ancestorType,
      'descendant',
    );

    const ancestors = await this.getAncestors(ancestorType, ancestorCodes);

    const formattedEntitiesByCode = await this.buildFormattedEntitiesByCode(
      [...ancestors, ...descendants],
      fields,
    );
    return descendants.map(descendant => ({
      ...formattedEntitiesByCode[descendant.code],
      ancestor: formattedEntitiesByCode[descendantToAncestor[descendant.code]],
    }));
  }

  async flatGroupByDescendantResponse(
    descendants: EntityType[],
    ancestorType: string,
    flat: keyof FlattableEntityFields,
  ) {
    const [ancestorCodes, descendantToAncestor] = await this.buildAncestorCodesAndMap(
      descendants,
      ancestorType,
      'descendant',
    );

    if (flat === 'code') {
      return Object.entries(descendantToAncestor).map(([descendantCode, ancestorCode]) => ({
        [descendantCode]: ancestorCode,
      }));
    }

    const ancestors = await this.getAncestors(ancestorType, ancestorCodes);

    const formattedEntitiesByCode = await this.buildFormattedEntitiesByCode(
      [...ancestors, ...descendants],
      flat,
    );
    return descendants.map(descendant => ({
      [formattedEntitiesByCode[descendant.code]]:
        formattedEntitiesByCode[descendantToAncestor[descendant.code]],
    }));
  }

  async buildResponse() {
    const { ancestorType, descendantType, groupBy = 'ancestor' } = this.req.query;
    const { entity, hierarchyId, allowedCountries, flat, fields } = this.req.ctx;

    if (!ancestorType || !descendantType) {
      throw new Error('Must provide ancestorType and descendantType query parameters');
    }

    const descendants = await entity.getDescendants(hierarchyId, {
      type: descendantType,
      country_code: allowedCountries,
    });

    if (groupBy === 'ancestor') {
      if (flat) {
        return this.flatGroupByAncestorResponse(descendants, ancestorType, flat);
      }
      return this.groupByAncestorResponse(descendants, ancestorType, fields);
    }

    if (flat) {
      return this.flatGroupByDescendantResponse(descendants, ancestorType, flat);
    }

    return this.groupByDescendantResponse(descendants, ancestorType, fields);
  }
}
