import { respond } from '@tupaia/utils';
import { buildPermissionsBasedMeditrakSyncQuery } from './meditrakSync';
import { allowNoPermissions } from '../../permissions';

// TODO: Tidy this up as part of RN-502

/**
 * Permissions based sync metadata
 * {
 *   changeCount: number of changes since last sync
 *   countries: countries included in the sync
 *   permissionGroups: permissions groups included in the sync
 * }
 * Responds to GET requests to the /changes/metadata endpoint
 */
export async function changesMetadata(req, res) {
  const { models } = req;

  await req.assertPermissions(allowNoPermissions);

  const { query, countries, permissionGroups } = await buildPermissionsBasedMeditrakSyncQuery(req, {
    select: 'count(*)',
  });
  const queryResult = await query.executeOnDatabase(models.database);
  const changeCount = Number.parseInt(queryResult[0].count);
  respond(res, { changeCount, countries, permissionGroups });
}
