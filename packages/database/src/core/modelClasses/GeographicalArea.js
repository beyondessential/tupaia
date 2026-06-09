import { SyncDirections } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class GeographicalAreaRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.GEOGRAPHICAL_AREA;

  // Exposed for access policy creation.
  get organisationUnitCode() {
    return this.code;
  }

  /**
   * @returns {Promise<import('./Country').CountryRecord>}
   */
  async country() {
    return ensure(
      await this.otherModels.country.findById(this.country_id),
      `Couldn’t find country for geographical area ${this.id} (expected country with ID ${this.country_id})`,
    );
  }

  /**
   * @returns {Promise<GeographicalAreaRecord>}
   */
  async parent() {
    if (!this.parent_id) return null;
    return ensure(
      await this.model.findById(this.parent_id),
      `Couldn’t find parent for geographical area ${this.id} (expected geographical area with ID ${this.parent_id})`,
    );
  }

  async getParents() {
    const geographicalAreaTree = await this.model.getAncestorsPath(this.id);

    // Remove first item (this item).
    geographicalAreaTree.shift();

    return geographicalAreaTree;
  }
}

export class GeographicalAreaModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

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
