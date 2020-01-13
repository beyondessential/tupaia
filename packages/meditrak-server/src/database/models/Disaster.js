/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { DatabaseModel } from '../DatabaseModel';
import { TYPES } from '..';

class DisasterType extends DatabaseType {
  static databaseType = TYPES.DISASTER;

  static joins = [
    {
      fields: {
        code: 'countryCode',
      },
      joinWith: TYPES.COUNTRY,
      joinCondition: [`${TYPES.COUNTRY}.code`, `${TYPES.DISASTER}.countryCode`],
    },
    {
      fields: {
        code: 'id',
      },
      joinWith: TYPES.ENTITY,
      joinCondition: [`${TYPES.ENTITY}.code`, `${TYPES.DISASTER}.id`],
    },
  ];

  async country() {
    return this.otherModels.country.findOne({ code: this.country_code });
  }
}

export class DisasterModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DisasterType;
  }
}
