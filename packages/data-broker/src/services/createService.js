/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDataApi } from '@tupaia/data-api';
import { TupaiaDataService } from './tupaia';
import { DhisService } from './dhis';

export const createService = (models, type) => {
  switch (type) {
    case 'dhis':
      return new DhisService(models);
    case 'tupaia':
      return new TupaiaDataService(models, new TupaiaDataApi(models.database));
    default:
      throw new Error(`Invalid service type: ${type}`);
  }
};
