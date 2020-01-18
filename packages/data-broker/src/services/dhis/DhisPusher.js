/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisDataHandler } from './DhisDataHandler';

const CODE = 'code';
const ID = 'id';
export const DATA_ELEMENT_ID_SCHEMES = { CODE, ID };

export class DhisPusher extends DhisDataHandler {
  push(value) {}

  async getDataElementId(dataElementIdScheme) {
    const { code } = this.dataSource;
    if (dataElementIdScheme === CODE) {
      return code;
    }
    // Using "id" id scheme, need to fetch the DHIS2 internal id
    const dataElementId = await this.api.getIdFromCode(this.api.resourceTypes.DATA_ELEMENT, code);
    if (!dataElementId) {
      throw new Error(`No data element with code ${code}`);
    }
    return dataElementId;
  }
}
