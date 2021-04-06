/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType } from '../../../models';
import { formatEntitiesForResponse } from '../format';
import { EntityResponseObject, FlattenedEntity } from '../types';
import { RelationsRequest } from './types';

type Pair = {
  descendant: string;
  ancestor: string;
};

type UnArray<T> = T extends (infer U)[] ? U : never;

export class EntityRelationsRoute extends Route<RelationsRequest> {
  async buildAncestorCodesAndPairs(descendants: EntityType[]): Promise<[string[], Pair[]]> {
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

    return [ancestorCodes, ancestorDescendantPairs];
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

  formattedEntitiesByCode<T extends FlattenedEntity[] | EntityResponseObject[]>(
    unformatted: EntityType[],
    formatted: T,
  ) {
    const formattedByCode: Record<string, UnArray<T>> = {};
    unformatted.forEach((unformattedEntity, index) => {
      formattedByCode[unformattedEntity.code] = formatted[index] as UnArray<T>;
    });
    return formattedByCode;
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
    const { models, ctx } = this.req;
    const { fields: ancestorFields, flat: ancestorFlat } = ctx.ancestor;
    const { fields: descendantFields, flat: descendantFlat } = ctx.descendant;

    const [ancestorCodes, pairs] = await this.buildAncestorCodesAndPairs(descendants);
    const ancestorToDescendants = reduceToArrayDictionary(pairs, 'ancestor', 'descendant');

    if (this.shouldPerformFastResponse()) {
      return Object.entries(ancestorToDescendants).map(([ancestorCode, descendantCodes]) => ({
        [ancestorCode]: descendantCodes,
      }));
    }

    const ancestors = await this.getAncestors(ancestorCodes);

    const formattedDescendants = descendantFlat
      ? await formatEntitiesForResponse(models, ctx, descendants, descendantFlat)
      : await formatEntitiesForResponse(models, ctx, descendants, descendantFields);
    const formattedDescendantsByCode = this.formattedEntitiesByCode(
      descendants,
      formattedDescendants,
    );

    if (ancestorFlat) {
      const formattedAncestors = await formatEntitiesForResponse(
        models,
        ctx,
        ancestors,
        ancestorFlat,
      );
      const formattedAncestorsByCode = this.formattedEntitiesByCode(ancestors, formattedAncestors);
      return ancestors.map(ancestor => ({
        [formattedAncestorsByCode[ancestor.code]]: ancestorToDescendants[ancestor.code].map(
          descendantCode => formattedDescendantsByCode[descendantCode],
        ),
      }));
    }

    const formattedAncestors = await formatEntitiesForResponse(
      models,
      ctx,
      ancestors,
      ancestorFields,
    );
    const formattedAncestorsByCode = this.formattedEntitiesByCode(ancestors, formattedAncestors);

    return ancestors.map(ancestor => ({
      ...formattedAncestorsByCode[ancestor.code],
      descendants: ancestorToDescendants[ancestor.code].map(
        descendantCode => formattedDescendantsByCode[descendantCode],
      ),
    }));
  }

  async groupByDescendantResponse(descendants: EntityType[]) {
    const { models, ctx } = this.req;
    const { fields: ancestorFields, flat: ancestorFlat } = ctx.ancestor;
    const { fields: descendantFields, flat: descendantFlat } = ctx.descendant;

    const [ancestorCodes, pairs] = await this.buildAncestorCodesAndPairs(descendants);
    const descendantToAncestor = reduceToDictionary(pairs, 'descendant', 'ancestor');

    if (this.shouldPerformFastResponse()) {
      return Object.entries(descendantToAncestor).map(([descendantCode, ancestorCode]) => ({
        [descendantCode]: ancestorCode,
      }));
    }

    const ancestors = await this.getAncestors(ancestorCodes);

    const formattedAncestors = ancestorFlat
      ? await formatEntitiesForResponse(models, ctx, ancestors, ancestorFlat)
      : await formatEntitiesForResponse(models, ctx, ancestors, ancestorFields);
    const formattedAncestorsByCode = this.formattedEntitiesByCode(descendants, formattedAncestors);

    if (descendantFlat) {
      const formattedDescendants = await formatEntitiesForResponse(
        models,
        ctx,
        descendants,
        descendantFlat,
      );
      const formattedDescendantsByCode = this.formattedEntitiesByCode(
        descendants,
        formattedDescendants,
      );
      return descendants
        .filter(descendant => formattedAncestorsByCode[descendantToAncestor[descendant.code]])
        .map(descendant => ({
          [formattedDescendantsByCode[descendant.code]]:
            formattedAncestorsByCode[descendantToAncestor[descendant.code]],
        }));
    }

    const formattedDescendants = await formatEntitiesForResponse(
      models,
      ctx,
      descendants,
      descendantFields,
    );
    const formattedDescendantsByCode = this.formattedEntitiesByCode(
      descendants,
      formattedDescendants,
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
