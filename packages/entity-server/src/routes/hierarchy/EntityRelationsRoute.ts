/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { reduceToDictionary, reduceToArrayDictionary } from '@tupaia/utils';
import { EntityType } from '../../models';
import {
  HierarchyRequest,
  HierarchyRequestParams,
  HierarchyRequestBody,
  HierarchyRequestQuery,
  EntityResponseObject,
} from './types';

export type RelationsRequest = HierarchyRequest<
  HierarchyRequestParams,
  | (EntityResponseObject & { descendants: EntityResponseObject[] })[] // groupBy: ancestor, flattenToCode: false
  | (EntityResponseObject & { ancestor: EntityResponseObject })[] // groupBy: descendant, flattenToCode: false
  | Record<string, string[]> // groupBy: ancestor, flattenToCode: true
  | Record<string, string>, // groupBy: descendant, flattenToCode: true
  HierarchyRequestBody,
  HierarchyRequestQuery & {
    ancestorType?: string;
    descendantType?: string;
    groupBy?: 'ancestor' | 'descendant';
    flattenToCode?: 'true' | 'false';
  }
>;

export class EntityRelationsRoute extends Route<RelationsRequest> {
  async buildDescendantAncestorPairs(descendants: EntityType[], ancestorType: string) {
    const { hierarchyId } = this.req.ctx;
    const descendantAncestorMapping = await this.req.models.entity.fetchAncestorDetailsByDescendantCode(
      descendants.map(descendant => descendant.code),
      hierarchyId,
      ancestorType,
    );

    return Object.entries(descendantAncestorMapping).map(([descendant, { code: ancestor }]) => ({
      descendant,
      ancestor,
    }));
  }

  async buildFormattedEntitiesByCode(ancestors: EntityType[], descendants: EntityType[]) {
    const allEntities = [...ancestors, ...descendants];
    const formattedEntities = await this.req.ctx.formatEntitiesForResponse(allEntities);
    const formattedEntitiesByCode: Record<string, EntityResponseObject> = {};
    allEntities.forEach((unformattedEntity, index) => {
      formattedEntitiesByCode[unformattedEntity.code] = formattedEntities[index];
    });
    return formattedEntitiesByCode;
  }

  async groupByAncestorResponse(
    descendants: EntityType[],
    ancestorType: string,
    flattenToCode: boolean,
  ) {
    const { entity, hierarchyId, allowedCountries } = this.req.ctx;

    const ancestorCodeToDescendantCodes = reduceToArrayDictionary(
      await this.buildDescendantAncestorPairs(descendants, ancestorType),
      'ancestor',
      'descendant',
    );

    if (flattenToCode) {
      return ancestorCodeToDescendantCodes;
    }

    const ancestorsWithDescendantsCodes = Object.keys(ancestorCodeToDescendantCodes);
    const ancestors =
      entity.type === ancestorType
        ? [entity]
        : await entity.getDescendants(hierarchyId, {
            code: ancestorsWithDescendantsCodes,
            country_code: allowedCountries,
          });

    const formattedEntitiesByCode = await this.buildFormattedEntitiesByCode(ancestors, descendants);
    return ancestors.map(ancestor => ({
      ...formattedEntitiesByCode[ancestor.code],
      descendants: ancestorCodeToDescendantCodes[ancestor.code].map(
        descendantCode => formattedEntitiesByCode[descendantCode],
      ),
    }));
  }

  async groupByDescendantResponse(
    descendants: EntityType[],
    ancestorType: string,
    flattenToCode: boolean,
  ) {
    const { entity, hierarchyId, allowedCountries } = this.req.ctx;

    const descendantCodeToAncestorCode = reduceToDictionary(
      await this.buildDescendantAncestorPairs(descendants, ancestorType),
      'descendant',
      'ancestor',
    );

    if (flattenToCode) {
      return descendantCodeToAncestorCode;
    }

    const ancestorsWithDescendantsCodes = Object.values(descendantCodeToAncestorCode);
    const ancestors =
      entity.type === ancestorType
        ? [entity]
        : await entity.getDescendants(hierarchyId, {
            code: ancestorsWithDescendantsCodes,
            country_code: allowedCountries,
          });

    const formattedEntitiesByCode = await this.buildFormattedEntitiesByCode(ancestors, descendants);
    return descendants.map(descendant => ({
      ...formattedEntitiesByCode[descendant.code],
      ancestor: formattedEntitiesByCode[descendantCodeToAncestorCode[descendant.code]],
    }));
  }

  async buildResponse() {
    const {
      ancestorType,
      descendantType,
      groupBy = 'ancestor',
      flattenToCode: flattenToCodeQueryParam,
    } = this.req.query;
    const flattenToCode = flattenToCodeQueryParam === 'true' || false;
    const { entity, hierarchyId, allowedCountries } = this.req.ctx;

    if (!ancestorType || !descendantType) {
      throw new Error('Must provide ancestorType and descendantType query parameters');
    }

    const descendants = await entity.getDescendants(hierarchyId, {
      type: descendantType,
      country_code: allowedCountries,
    });

    if (groupBy === 'ancestor') {
      return this.groupByAncestorResponse(descendants, ancestorType, flattenToCode);
    }

    return this.groupByDescendantResponse(descendants, ancestorType, flattenToCode);
  }
}
