/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class GeographicalAreaType extends DatabaseType {
  static databaseType = TYPES.GEOGRAPHICAL_AREA;

  static meditrakConfig = {
    minAppVersion: '0.0.23',
  };

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

  async children() {
    return this.model.find({ parentId: this.id });
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
