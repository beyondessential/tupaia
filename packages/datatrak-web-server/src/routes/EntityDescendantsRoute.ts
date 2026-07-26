import camelcaseKeys from 'camelcase-keys';
import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { ensure, isNotNullish } from '@tupaia/tsutils';
import { DatatrakWebEntityDescendantsRequest, Entity } from '@tupaia/types';

import { DatatrakWebServerModelRegistry } from '../types';
import { sortSearchResults } from '../utils';

export type EntityDescendantsRequest = Request<
  DatatrakWebEntityDescendantsRequest.Params,
  DatatrakWebEntityDescendantsRequest.ResBody,
  DatatrakWebEntityDescendantsRequest.ReqBody,
  DatatrakWebEntityDescendantsRequest.ReqQuery
>;

const DEFAULT_FIELDS = ['id', 'parent_name', 'code', 'name', 'type'];

const DEFAULT_PAGE_SIZE = 100;

// Resolve directly against the DB, not central's entities list endpoint: that
// endpoint scopes non-BES-admin users to their Tupaia Admin Panel countries,
// which a DataTrak data-entry user doesn't have — so it returned nothing and the
// parent/grandparent filter 500'd. The id uniquely identifies the project's row.
async function getEntityCodeFromId(models: DatatrakWebServerModelRegistry, id: string) {
  const entity = ensure(await models.entity.findById(id), `No entity found with id ${id}`);
  return entity.code;
}

export class EntityDescendantsRoute extends Route<EntityDescendantsRequest> {
  public async buildResponse() {
    const { query, ctx, session, models } = this.req;
    const { services } = ctx;
    const isLoggedIn = !!session;

    let recentEntities: Entity['id'][] = [];

    const {
      filter: { countryCode, projectCode, grandparentId, parentId, type, ...restOfFilter },
      searchString,
      fields = DEFAULT_FIELDS,
      pageSize = DEFAULT_PAGE_SIZE,
    } = query;

    // A bare single-id lookup is a QR scan. Capture it so we can fall back to a
    // code lookup if the id doesn't resolve within the project (see below).
    const scannedId = typeof restOfFilter.id === 'string' ? restOfFilter.id : undefined;

    if (isLoggedIn) {
      const currentUser = ensure(
        await models.user.findOne({ email: session.email }),
        `No user exists with email ${session.email}`,
      );
      recentEntities = currentUser.getRecentEntityIds(countryCode, type);
    }

    const filter = {
      generational_distance: {},
      country_code: countryCode,
      type,
      name: searchString
        ? {
            comparator: 'ilike',
            comparisonValue: `%${searchString}%`,
          }
        : undefined,
      ...restOfFilter,
    };

    let entityCode = projectCode as string;

    if (parentId) {
      // If parentId is provided, we just want to get the children of that entity
      entityCode = await getEntityCodeFromId(models, parentId);
      filter.generational_distance = {
        comparator: '=',
        comparisonValue: 1,
      };
    } else if (grandparentId) {
      // If grandparentId is provided, we just want to get the grandchildren of that entity
      entityCode = await getEntityCodeFromId(models, grandparentId);
      filter.generational_distance = {
        comparator: '=',
        comparisonValue: 2,
      };
    }

    let entities = await services.entity.getDescendantsOfEntity(
      projectCode,
      entityCode,
      {
        fields,
        filter,
        pageSize,
      },
      false,
      !isLoggedIn,
    );

    // Printed QR codes encode an entity's pre-epic id. Sub-country entities are now
    // duplicated per project, and each project's copy has a new id sharing the old
    // `code`, so scanning finds nothing in projects where the entity was duplicated.
    // Resolve the scanned id → code (the canonical row is still on central) and
    // re-query by code to pick up the project's copy. Gated on an empty result so
    // in-project scans stay zero-behaviour-change with no extra DB call.
    if (
      entities.length === 0 &&
      scannedId &&
      !parentId &&
      !grandparentId &&
      !('code' in restOfFilter)
    ) {
      // Non-throwing lookup: a genuinely-invalid scan should surface as an empty
      // result ("No matching entity found"), not a 500.
      const entity = await models.entity.findById(scannedId);
      const code = entity?.code;
      if (code) {
        const { id: _omit, ...filterWithoutId } = filter as typeof filter & { id?: string };
        entities = await services.entity.getDescendantsOfEntity(
          projectCode,
          entityCode,
          {
            fields,
            filter: { ...filterWithoutId, code },
            pageSize,
          },
          false,
          !isLoggedIn,
        );
      }
    }

    const sortedEntities = searchString
      ? sortSearchResults(searchString, entities)
      : [
          ...recentEntities
            .map((id: string) => {
              const entity = entities.find((e: any) => e.id === id);
              if (!entity) {
                // This can happen if the entity has been deleted; or it’s new and the entity
                // hierarchy cache hasn’t refreshed yet
                return null;
              }
              return { ...entity, isRecent: true };
            })
            .filter(isNotNullish),
          ...entities.sort((a: any, b: any) => a.name?.localeCompare(b.name) ?? 0), // SQL projection may exclude `name` attribute
        ];

    return camelcaseKeys(sortedEntities, { deep: true });
  }
}
