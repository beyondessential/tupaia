/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType } from '../../../models';
import { formatEntitiesForResponse } from '../format';
import { RelationsRequest } from './types';

type Pair = {
  descendant: string;
  ancestor: string;
};

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
    const { entity, hierarchyId } = this.req.ctx;
    const { type: ancestorType, filter } = this.req.ctx.ancestor;
    const { code: filterCode } = filter;
    let codesToUse: string[];
    if (!filterCode) {
      codesToUse = ancestorsWithDescendantsCodes;
    } else {
      codesToUse = Array.isArray(filterCode)
        ? ancestorsWithDescendantsCodes.filter(code => filterCode.includes(code))
        : ancestorsWithDescendantsCodes.filter(code => filterCode === code);
    }

    return entity.type === ancestorType
      ? [entity]
      : entity.getDescendants(hierarchyId, {
          ...filter,
          code: codesToUse,
        });
  }

  async getFormattedEntitiesByCode(ancestors: EntityType[], descendants: EntityType[]) {
    const { models, ctx } = this.req;
    const { field: ancestorField } = ctx.ancestor;
    const { field: descendantField } = ctx.descendant;

    const formattedEntities =
      ancestorField === descendantField
        ? await formatEntitiesForResponse(
            models,
            ctx,
            [...ancestors, ...descendants],
            ancestorField,
          )
        : [
            ...(await formatEntitiesForResponse(models, ctx, ancestors, ancestorField)),
            ...(await formatEntitiesForResponse(models, ctx, descendants, descendantField)),
          ];
    const formattedEntitiesByCode: Record<string, string> = {};
    [...ancestors, ...descendants].forEach((entity, index) => {
      formattedEntitiesByCode[entity.code] = formattedEntities[index];
    });
    return formattedEntitiesByCode;
  }

  shouldPerformFastResponse() {
    const { field: ancestorField, filter: ancestorFilter } = this.req.ctx.ancestor;
    const { field: descendantField } = this.req.ctx.descendant;
    return (
      ancestorField === 'code' &&
      descendantField === 'code' &&
      Object.keys(ancestorFilter).length === 0
    );
  }

  buildMap(pairs: Pair[]) {
    return this.req.query.groupBy === 'ancestor'
      ? reduceToArrayDictionary(pairs, 'ancestor', 'descendant')
      : reduceToDictionary(pairs, 'descendant', 'ancestor');
  }

  async buildResponse() {
    const { entity, hierarchyId, allowedCountries } = this.req.ctx;
    const { type: descendantType, filter } = this.req.ctx.descendant;

    const descendants = await entity.getDescendants(hierarchyId, {
      ...filter,
      type: descendantType,
      country_code: allowedCountries,
    });

    const [ancestorCodes, pairs] = await this.buildAncestorCodesAndPairs(descendants);

    if (this.shouldPerformFastResponse()) {
      return this.buildMap(pairs);
    }

    const ancestors = await this.getAncestors(ancestorCodes);
    const formattedEntitiesByCode = await this.getFormattedEntitiesByCode(ancestors, descendants);
    const formattedPairs = pairs
      .filter(pair => formattedEntitiesByCode[pair.ancestor])
      .map(pair => ({
        ancestor: formattedEntitiesByCode[pair.ancestor],
        descendant: formattedEntitiesByCode[pair.descendant],
      }));

    return this.buildMap(formattedPairs);
  }
}
