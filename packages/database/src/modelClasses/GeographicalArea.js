/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class GeographicalAreaType extends DatabaseType {
  static databaseType = TYPES.GEOGRAPHICAL_AREA;

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
  get DatabaseTypeClass() {
    return GeographicalAreaType;
  }

  async getAncestorsPath(geographicalAreaId) {
    const geographicalAreaTree = await this.database.findWithParents(
      TYPES.GEOGRAPHICAL_AREA,
      geographicalAreaId,
    );
    return Promise.all(
      geographicalAreaTree.map(treeItemFields => this.generateInstance(treeItemFields)),
    );
  }
}
