/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataElementMapper } from '/apiV1/dataBuilders/DataElementMapper';

/**
 *
 * @param {DhisApi} dhisApi
 * @param {Object<string, Object>} dataSources
 * @returns {Object<string, string[]>}
 */
export const mapDataSourcesToElementCodes = async (dhisApi, dataSources) =>
  new DataElementMapper(dhisApi).getMapFromDataSources(dataSources);
