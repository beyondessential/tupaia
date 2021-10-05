/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { QueryConjunctions } from '@tupaia/server-boilerplate';

import { EntityServerModelRegistry } from '../../../types';
import { EntityFilter, EntityType } from '../../../models';
import { formatEntitiesForResponse } from '../format';
import { MultiEntityRelationshipsContext } from './types';

type Pair = {
  descendant: string;
  ancestor: string;
};

export class ResponseBuilder {
  private readonly models: EntityServerModelRegistry;

  private readonly ctx: MultiEntityRelationshipsContext & { ancestor: { type: string } };

  private readonly groupBy: 'ancestor' | 'descendant';

  constructor(
    models: EntityServerModelRegistry,
    ctx: MultiEntityRelationshipsContext,
    groupBy: 'ancestor' | 'descendant' = 'ancestor',
  ) {
    this.models = models;
    this.groupBy = groupBy;

    const ancestorType = ctx.ancestor.type || ctx.entities[0]?.type;
    if (ancestorType === null) {
      throw new Error('No explicit ancestorType provided and entity type is null');
    }

    this.ctx = {
      ...ctx,
      ancestor: { ...ctx.ancestor, type: ancestorType },
    };
  }

  private async buildAncestorCodesAndPairs(descendants: EntityType[]): Promise<[string[], Pair[]]> {
    const { hierarchyId, entities } = this.ctx;
    const { type: ancestorType } = this.ctx.ancestor;
    const { type: descendantType } = this.ctx.descendant;

    const descendantCodes = descendants.map(descendant => descendant.code);
    if (ancestorType === descendantType) {
      // types match, so just return descendants as mapping to themselves
      return [
        descendantCodes,
        descendantCodes.map(descendant => ({ descendant, ancestor: descendant })),
      ];
    }

    const descendantAncestorMapping = await this.models.entity.fetchAncestorDetailsByDescendantCode(
      descendantCodes,
      hierarchyId,
      ancestorType,
    );

    entities.forEach(entity => {
      // Add self to descendant<->ancestor mapping if matching requirements
      if (descendantCodes.includes(entity.code) && entity.type === ancestorType) {
        descendantAncestorMapping[entity.code] = { code: entity.code, name: entity.name };
      }
    });

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
    const { entities, hierarchyId } = this.ctx;
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

    return this.models.entity.getRelativesOfEntities(
      hierarchyId,
      entities.map(entity => entity.id),
      {
        ...filter,
        type: ancestorType,
        code: codesToUse,
      },
    );
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

  isDefaultFilter = (filter: EntityFilter) => {
    const keys = Object.keys(filter);
    const key = keys[0];

    return (
      keys.length === 1 &&
      key === QueryConjunctions.AND &&
      filter[QueryConjunctions.AND]?.country_code !== undefined
    );
  };

  private shouldPerformFastResponse() {
    const { field: ancestorField, filter: ancestorFilter } = this.ctx.ancestor;
    const { field: descendantField } = this.ctx.descendant;

    return (
      ancestorField === 'code' && descendantField === 'code' && this.isDefaultFilter(ancestorFilter)
    );
  }

  private buildMap(pairs: Pair[]) {
    return this.groupBy === 'ancestor'
      ? reduceToArrayDictionary(pairs, 'ancestor', 'descendant')
      : reduceToDictionary(pairs, 'descendant', 'ancestor');
  }

  async build() {
    const { entities, hierarchyId } = this.ctx;
    const { type: descendantType, filter } = this.ctx.descendant;

    const descendants = await this.models.entity.getRelativesOfEntities(
      hierarchyId,
      entities.map(entity => entity.id),
      {
        ...filter,
        type: descendantType,
      },
    );

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
