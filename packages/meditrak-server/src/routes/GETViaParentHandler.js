/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';

// const CUSTOM_FOREIGN_KEYS = {
//   [createMultiResourceKey(TYPES.USER_COUNTRY_PERMISSION, TYPES.USER_ACCOUNT)]: 'user_id',
//   [createMultiResourceKey(TYPES.USER_GEOGRAPHICAL_AREA_PERMISSION, TYPES.USER_ACCOUNT)]: 'user_id',
//   [createMultiResourceKey(TYPES.USER_FACILITY_PERMISSION, TYPES.USER_ACCOUNT)]: 'user_id',
// };
// const getForeignKeyColumn = (recordType, parentRecordType) => {
//   const key = createMultiResourceKey(recordType, parentRecordType);
//   return CUSTOM_FOREIGN_KEYS[key] || `${parentRecordType}_id`;
// };
// const PARENT_RECORD_FINDERS = {
//   [`${TYPES.ALERT}/${TYPES.COMMENT}`]: findOrCountJoinChildren,
// };

export class GETViaParentHandler extends GETHandler {
  // async handleRequest() {
  //   const { params, query } = this.req;
  //   const { parentResource, parentRecordId } = params;
  //   const parentRecordType = resourceToRecordType(parentResource);
  // }
  // findOrCountRecords() {
  //   const recordAccessor = PARENT_RECORD_FINDERS[`${parentRecordType}/${recordType}`];
  //   if (recordAccessor) {
  //     return recordAccessor(
  //       models,
  //       findOrCount,
  //       recordType,
  //       parentRecordType,
  //       parentRecordId,
  //       criteria,
  //       options,
  //     );
  //   }
  //   return database[findOrCount](
  //     recordType,
  //     { ...criteria, [getForeignKeyColumn(recordType, parentRecordType)]: parentRecordId },
  //     options,
  //   );
  // }
}
