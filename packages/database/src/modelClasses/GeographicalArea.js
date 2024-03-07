/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class GeographicalAreaRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.GEOGRAPHICAL_AREA;

  // Exposed for access policy creation.
  get organisationUnitCode() {
    return this.code;
  }

  async country() {
    return this.otherModels.country.findById(this.country_id);
  }

  async parent() {
    return this.model.findById(this.parent_id);
  }

  async getParents() {
    const geographicalAreaTree = await this.model.getAncestorsPath(this.id);

    // Remove first item (this item).
    geographicalAreaTree.shift();

    return geographicalAreaTree;
  }
}

export class GeographicalAreaModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return GeographicalAreaRecord;
  }

  async getAncestorsPath(geographicalAreaId) {
    const geographicalAreaTree = await this.database.findWithParents(
      RECORDS.GEOGRAPHICAL_AREA,
      geographicalAreaId,
    );
    return Promise.all(
      geographicalAreaTree.map(treeItemFields => this.generateInstance(treeItemFields)),
    );
  }
}
