import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { PermissionsError } from '@tupaia/utils';
import { TupaiaAdminGETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../../permissions';
import { assertUserHasAccessToLandingPage } from './assertUserHasAccessToLandingPage';

const createLandingPageDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) return criteria;
  const projects = await models.project.getAccessibleProjects(accessPolicy);
  const projectCodes = projects.map(p => p.code);

  if (!projectCodes.length) throw new Error('No projects found for user');

  const projectCodeFilters = criteria['landing_page.project_codes']?.comparisonValue
    ?.replace(/{|}/g, '')
    .split(',')
    .filter(Boolean);

  const projectCodesToQuery = projectCodeFilters?.length
    ? projectCodes.filter(code => projectCodeFilters.includes(code))
    : projectCodes;

  if (projectCodeFilters?.length && !projectCodesToQuery.length)
    throw new PermissionsError('No access to project codes in query');

  return {
    [QUERY_CONJUNCTIONS.RAW]: {
      sql: `project_codes && ARRAY[${projectCodesToQuery.map(_ => '?')}]`,
      parameters: projectCodesToQuery,
    },
  };
};

/**
 * Handles endpoints:
 * - /landingPages
 * - /landingPages/:landingPageId
 */

export class GETLandingPages extends TupaiaAdminGETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(landingPageId, options) {
    const landingPagePermissionChecker = accessPolicy =>
      assertUserHasAccessToLandingPage(this.models, accessPolicy, landingPageId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, landingPagePermissionChecker]),
    );
    return super.findSingleRecord(landingPageId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createLandingPageDBFilter(this.accessPolicy, this.models, criteria);

    return { dbConditions, dbOptions: options };
  }
}
