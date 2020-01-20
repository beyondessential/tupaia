/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisService } from './dhis';

const TYPE_TO_SERVICE = {
  dhis: DhisService,
};

export const getServiceFromDataSource = (dataSource, metadata) => {
  const ServiceClass = TYPE_TO_SERVICE[dataSource.service_type];
  return new ServiceClass(dataSource, metadata);
};
