import { getKeysSortedByValues, respond, UnauthenticatedError } from '@tupaia/utils';
import { getUniversalTypes } from '../../../database/utilities';
import { buildMeditrakSyncQuery } from '../meditrakSync';
import { fetchRequestingMeditrakDevice } from '../utilities';

// TODO: Tidy this up as part of RN-502

const MAX_FAILS_BEFORE_LOG_OUT = 2;
const MAX_FAILS_BEFORE_TYPE_EXCLUSION = 5;

const getSyncTypesOrderedByDescVersion = models => {
  const versionByType = models.getMinAppVersionByType();
  const typesToSync = models.getTypesToSyncWithMeditrak();

  return getKeysSortedByValues(versionByType, { asc: false }).filter(type =>
    typesToSync.includes(type),
  );
};

/**
 * This class handles `countChanges` requests made by legacy installations of the meditrak app,
 * i.e. installations that do not specify their version with each request
 *
 * Algorithm
 * ---------
 * 1. If the requesting device cannot be identified, allow `MAX_FAILS_BEFORE_LOG_OUT`. Then log
 * out the user. The next time they will log in, we will be able to identify their device
 * 2. After the device is identified, look at the `meditrak_device` table. If `app_version` or
 * `config.unsupportedTypes` is defined, they will be used to calculate the supported types. End algorithm
 * 3. After `MAX_FAILS_BEFORE_TYPE_EXCLUSION`, exclude one additional type in each failed request.
 * Start from the most recently added type to the last one. Repeat this until sync succeeds
 */
export class LegacyCountChangesHandler {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async logOutUser() {
    const { models, userId } = this.req;
    await models.refreshToken.delete({ user_id: userId });
    throw new UnauthenticatedError('Refresh token has expired, please log in again');
  }

  /**
   * If the user's device is not known, we will need them to log out and log in again.
   * That way we can start tracking their device and save custom troubleshooting information for it
   */
  checkShouldLogOutUser = (meditrakDevice, failCount) =>
    !meditrakDevice && failCount > MAX_FAILS_BEFORE_LOG_OUT;

  /**
   * Calculates the number of failed change ("sync") requests for the same client
   *
   * To calculate the number of failed sync requests, we look at multiple `change` requests by
   * the same client (identified by their `refreshToken`) with the same `since` parameter.
   * There are two reasons why this may have happened:
   * 1. There we no changes of supported record types since the last sync
   * 2. The sync operation fails in the app
   *
   * To exclude scenario 1, we only count requests that include "universal" types.
   * Those types are supported by all versions of the app, thus a successful request would
   * have updated the `since` parameter.
   *
   * @param {*} req
   * @returns {Promise<number>}
   */
  async calculateFailCount() {
    const { apiRequestLogId, database, query, refreshToken } = this.req;
    const { since } = query;

    if (!refreshToken || !since) {
      // Not enough data for our calculation
      return 0;
    }

    const [{ count }] = await database.executeSql(
      `
    SELECT
      COUNT(id)
    FROM
      api_request_log
    WHERE
      refresh_token = ? AND
      query->>'since' = ? AND
      (metadata->>'changesIncludeUniversalTypes')::boolean = true
      AND id <> ?`,
      [refreshToken, since, apiRequestLogId],
    );

    return parseInt(count, 10);
  }

  /**
   * Gets the list of types by descending app version, finds the last type that was marked as
   * unsupported for the given device, and adds the next type from the list
   *
   * @param {MeditrakDeviceModel} meditrakDevice
   */
  async addNextUnsupportedType(meditrakDevice) {
    const { models } = this.req;
    const { config } = meditrakDevice;
    const { unsupportedTypes = [] } = config;

    const types = getSyncTypesOrderedByDescVersion(models);
    const lastUnsupportedType = unsupportedTypes[unsupportedTypes.length - 1];
    // Add 2 to the index to slice until the next item from the current last
    const newUnsupportedTypes = types.slice(0, types.indexOf(lastUnsupportedType) + 2);

    // eslint-disable-next-line no-param-reassign
    meditrakDevice.config = { ...config, unsupportedTypes: newUnsupportedTypes };
    return meditrakDevice.save();
  }

  checkShouldAddNextUnsupportedType = async (meditrakDevice, failCount) => {
    // We can only set unsupported types for a known device. No need to do it if we know the app version
    const deviceMeetsRequirements = meditrakDevice && !meditrakDevice.app_version;
    return failCount > MAX_FAILS_BEFORE_TYPE_EXCLUSION && deviceMeetsRequirements;
  };

  async setChangesIncludeUniversalTypes() {
    const { apiRequestLogId, models } = this.req;

    const apiRequestLog = await models.apiRequestLog.findById(apiRequestLogId);
    apiRequestLog.metadata = {
      ...apiRequestLog.metadata,
      changesIncludeUniversalTypes: true,
    };
    return apiRequestLog.save();
  }

  async checkRemainingChangesIncludeUniversalTypes() {
    const { models, query } = this.req;

    const universalTypes = getUniversalTypes(models);

    const { query: dbQuery } = await buildMeditrakSyncQuery(
      {
        ...this.req,
        query: { ...query, recordTypes: universalTypes.join(',') },
      },
      { select: 'count(*)' },
    );
    const result = await dbQuery.executeOnDatabase(models.database);
    const changesCount = parseInt(result[0].count);

    return changesCount > 0;
  }

  async handleSetUp() {
    // If changes include types supported by all version of the app ("universal"),
    // save this information since we need it for calculating the failed request count
    if (await this.checkRemainingChangesIncludeUniversalTypes()) {
      await this.setChangesIncludeUniversalTypes();
    }

    const meditrakDevice = await fetchRequestingMeditrakDevice(this.req);
    const failCount = await this.calculateFailCount();
    if (await this.checkShouldAddNextUnsupportedType(meditrakDevice, failCount)) {
      await this.addNextUnsupportedType(meditrakDevice);
    }
    if (this.checkShouldLogOutUser(meditrakDevice, failCount)) {
      await this.logOutUser();
    }
  }

  async handle() {
    await this.handleSetUp();
    const { query } = await buildMeditrakSyncQuery(this.req, { select: 'count(*)' });
    const queryResult = await query.executeOnDatabase(this.req.models.database);
    const changeCount = parseInt(queryResult[0].count);
    respond(this.res, { changeCount });
  }
}
