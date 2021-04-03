/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType } from '../../../models';
import { formatEntitiesForResponse } from '../format';
import {
  EntityResponseObject,
  EntityResponse,
  FlattableEntityFields,
  ExtendedEntityFields,
} from '../types';
import { RelationsRequest } from './types';

export class EntityRelationsRoute extends Route<RelationsRequest> {
  async buildAncestorCodesAndMap(
    descendants: EntityType[],
    groupBy: 'ancestor',
  ): Promise<[string[], Record<string, string[]>]>;
  async buildAncestorCodesAndMap(
    descendants: EntityType[],
    groupBy: 'descendant',
  ): Promise<[string[], Record<string, string>]>;
  async buildAncestorCodesAndMap(descendants: EntityType[], groupBy: 'ancestor' | 'descendant') {
    const { hierarchyId } = this.req.ctx;
    const { type: ancestorType } = this.req.ctx.ancestor;
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

  async getAncestors(ancestorsWithDescendantsCodes: string[]) {
    const { entity, hierarchyId, allowedCountries } = this.req.ctx;
    const { type: ancestorType, filter } = this.req.ctx.ancestor;
    return entity.type === ancestorType
      ? [entity]
      : entity.getDescendants(hierarchyId, {
          code: ancestorsWithDescendantsCodes,
          ...filter,
          country_code: allowedCountries,
        });
  }

  async formatEntitiesByCode(
    entities: EntityType[],
    flat: keyof FlattableEntityFields,
  ): Promise<Record<string, FlattableEntityFields[keyof FlattableEntityFields]>>;
  async formatEntitiesByCode(
    entities: EntityType[],
    fields: (keyof ExtendedEntityFields)[],
  ): Promise<Record<string, EntityResponseObject>>;
  async formatEntitiesByCode(
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

  shouldPerformFastResponse() {
    const { flat: ancestorFlat, filter: ancestorFilter } = this.req.ctx.ancestor;
    const { flat: descendantFlat } = this.req.ctx.descendant;
    return (
      ancestorFlat === 'code' &&
      descendantFlat === 'code' &&
      Object.keys(ancestorFilter).length === 0
    );
  }

  async groupByAncestorResponse(descendants: EntityType[]) {
    const { fields: ancestorFields, flat: ancestorFlat } = this.req.ctx.ancestor;
    const { fields: descendantFields, flat: descendantFlat } = this.req.ctx.descendant;

    const [ancestorCodes, ancestorToDescendants] = await this.buildAncestorCodesAndMap(
      descendants,
      'ancestor',
    );

    if (this.shouldPerformFastResponse()) {
      return Object.entries(ancestorToDescendants).map(([ancestorCode, descendantCodes]) => ({
        [ancestorCode]: descendantCodes,
      }));
    }

    const ancestors = await this.getAncestors(ancestorCodes);

    const formattedDescendantsByCode = descendantFlat
      ? await this.formatEntitiesByCode(descendants, descendantFlat)
      : await this.formatEntitiesByCode(descendants, descendantFields);

    if (ancestorFlat) {
      const formattedAncestorsByCode = await this.formatEntitiesByCode(ancestors, ancestorFlat);
      return ancestors.map(ancestor => ({
        [formattedAncestorsByCode[ancestor.code]]: ancestorToDescendants[ancestor.code].map(
          descendantCode => formattedDescendantsByCode[descendantCode],
        ),
      }));
    }

    const formattedAncestorsByCode = await this.formatEntitiesByCode(ancestors, ancestorFields);

    return ancestors.map(ancestor => ({
      ...formattedAncestorsByCode[ancestor.code],
      descendants: ancestorToDescendants[ancestor.code].map(
        descendantCode => formattedDescendantsByCode[descendantCode],
      ),
    }));
  }

  async groupByDescendantResponse(descendants: EntityType[]) {
    const { fields: ancestorFields, flat: ancestorFlat } = this.req.ctx.ancestor;
    const { fields: descendantFields, flat: descendantFlat } = this.req.ctx.descendant;

    const [ancestorCodes, descendantToAncestor] = await this.buildAncestorCodesAndMap(
      descendants,
      'descendant',
    );

    if (this.shouldPerformFastResponse()) {
      return Object.entries(descendantToAncestor).map(([descendantCode, ancestorCode]) => ({
        [descendantCode]: ancestorCode,
      }));
    }

    const ancestors = await this.getAncestors(ancestorCodes);

    const formattedAncestorsByCode = ancestorFlat
      ? await this.formatEntitiesByCode(ancestors, ancestorFlat)
      : await this.formatEntitiesByCode(ancestors, ancestorFields);

    if (descendantFlat) {
      const formattedDescendantsByCode = await this.formatEntitiesByCode(
        descendants,
        descendantFlat,
      );
      return descendants
        .filter(descendant => formattedAncestorsByCode[descendantToAncestor[descendant.code]])
        .map(descendant => ({
          [formattedDescendantsByCode[descendant.code]]:
            formattedAncestorsByCode[descendantToAncestor[descendant.code]],
        }));
    }

    const formattedDescendantsByCode = await this.formatEntitiesByCode(
      descendants,
      descendantFields,
    );

    return descendants
      .filter(descendant => formattedAncestorsByCode[descendantToAncestor[descendant.code]])
      .map(descendant => ({
        ...formattedDescendantsByCode[descendant.code],
        ancestor: formattedAncestorsByCode[descendantToAncestor[descendant.code]],
      }));
  }

  async buildResponse() {
    const { groupBy = 'ancestor' } = this.req.query;

    const { entity, hierarchyId, allowedCountries } = this.req.ctx;
    const { type: descendantType, filter } = this.req.ctx.descendant;

    const descendants = await entity.getDescendants(hierarchyId, {
      ...filter,
      type: descendantType,
      country_code: allowedCountries,
    });

    return groupBy === 'ancestor'
      ? this.groupByAncestorResponse(descendants)
      : this.groupByDescendantResponse(descendants);
  }
}
