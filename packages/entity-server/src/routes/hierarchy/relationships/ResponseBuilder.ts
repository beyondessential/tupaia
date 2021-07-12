/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityServerModelRegistry } from '../../../types';
import { EntityType } from '../../../models';
import { formatEntitiesForResponse } from '../format';
import { RelationshipsContext } from './types';

type Pair = {
  descendant: string;
  ancestor: string;
};

export class ResponseBuilder {
  private readonly models: EntityServerModelRegistry;

  private readonly ctx: RelationshipsContext & { ancestor: { type: string } };

  private readonly groupBy: 'ancestor' | 'descendant';

  constructor(
    models: EntityServerModelRegistry,
    ctx: RelationshipsContext,
    groupBy: 'ancestor' | 'descendant' = 'ancestor',
  ) {
    this.models = models;
    this.groupBy = groupBy;

    const ancestorType = ctx.ancestor.type || ctx.entity.type;
    if (ancestorType === null) {
      throw new Error('No explicit ancestorType provided and entity type is null');
    }

    this.ctx = {
      ...ctx,
      ancestor: { ...ctx.ancestor, type: ancestorType },
    };
  }

  private async buildAncestorCodesAndPairs(descendants: EntityType[]): Promise<[string[], Pair[]]> {
    const { hierarchyId, entity } = this.ctx;
    const { type: ancestorType } = this.ctx.ancestor;
    const descendantCodes = descendants.map(descendant => descendant.code);
    const descendantAncestorMapping = await this.models.entity.fetchAncestorDetailsByDescendantCode(
      descendantCodes,
      hierarchyId,
      ancestorType,
    );

    // Add self to descendant<->ancestor mapping if matching requirements
    if (descendantCodes.includes(entity.code) && entity.type === ancestorType) {
      descendantAncestorMapping[entity.code] = { code: entity.code, name: entity.name };
    }

    const ancestorCodes = [
      ...new Set(Object.values(descendantAncestorMapping).map(ancestor => ancestor.code)),
    ];

    const ancestorDescendantPairs = Object.entries(descendantAncestorMapping).map(
      ([descendant, { code: ancestor }]) => ({
        descendant,
        ancestor,
      }),
    );

    return [ancestorCodes, ancestorDescendantPairs];
  }

  private async getAncestorTypeRelatives(ancestorsWithDescendantsCodes: string[]) {
    const { entity, hierarchyId } = this.ctx;
    const { type: ancestorType, filter } = this.ctx.ancestor;
    const { code: filterCode } = filter;
    let codesToUse: string[];
    if (!filterCode) {
      codesToUse = ancestorsWithDescendantsCodes;
    } else {
      codesToUse = Array.isArray(filterCode)
        ? ancestorsWithDescendantsCodes.filter(code => filterCode.includes(code))
        : ancestorsWithDescendantsCodes.filter(code => filterCode === code);
    }

    return entity.getRelatives(hierarchyId, {
      ...filter,
      type: ancestorType,
      code: codesToUse,
    });
  }

  private async getFormattedEntitiesByCode(ancestors: EntityType[], descendants: EntityType[]) {
    const { field: ancestorField } = this.ctx.ancestor;
    const { field: descendantField } = this.ctx.descendant;

    const formattedEntities =
      ancestorField === descendantField
        ? await formatEntitiesForResponse(
            this.models,
            this.ctx,
            [...ancestors, ...descendants],
            ancestorField,
          )
        : [
            ...(await formatEntitiesForResponse(this.models, this.ctx, ancestors, ancestorField)),
            ...(await formatEntitiesForResponse(
              this.models,
              this.ctx,
              descendants,
              descendantField,
            )),
          ];
    const formattedEntitiesByCode: Record<string, string> = {};
    [...ancestors, ...descendants].forEach((entity, index) => {
      formattedEntitiesByCode[entity.code] = formattedEntities[index];
    });
    return formattedEntitiesByCode;
  }

  private shouldPerformFastResponse() {
    const { field: ancestorField, filter: ancestorFilter } = this.ctx.ancestor;
    const { field: descendantField } = this.ctx.descendant;
    const { country_code, ...restOfAncestorFilter } = ancestorFilter;
    return (
      ancestorField === 'code' &&
      descendantField === 'code' &&
      Object.keys(restOfAncestorFilter).length === 0
    );
  }

  private buildMap(pairs: Pair[]) {
    return this.groupBy === 'ancestor'
      ? reduceToArrayDictionary(pairs, 'ancestor', 'descendant')
      : reduceToDictionary(pairs, 'descendant', 'ancestor');
  }

  async build() {
    const { entity, hierarchyId } = this.ctx;
    const { type: descendantType, filter } = this.ctx.descendant;

    const descendants = await entity.getRelatives(hierarchyId, {
      ...filter,
      type: descendantType,
    });

    const [ancestorCodes, pairs] = await this.buildAncestorCodesAndPairs(descendants);

    if (this.shouldPerformFastResponse()) {
      return this.buildMap(pairs);
    }

    const ancestors = await this.getAncestorTypeRelatives(ancestorCodes);
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
