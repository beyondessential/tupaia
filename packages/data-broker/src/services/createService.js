/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisService } from './dhis';

export const TYPE_TO_SERVICE = {
  dhis: DhisService,
};

export const createService = (models, type) => {
  const ServiceClass = TYPE_TO_SERVICE[type];
  return new ServiceClass(models);
};
