/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { DataTableServiceBuilder, getDataTableServiceType } from './DataTableServiceBuilder';
import { DataTableType } from '../models';

export const getDataTableService = (dataTable: DataTableType, req: Request<any, any, any, any>) => {
  const { accessPolicy, models, ctx } = req;

  const serviceType = getDataTableServiceType(dataTable);
  const dataTableService = new DataTableServiceBuilder()
    .setServiceType(serviceType)
    .setContext({ apiClient: ctx.services, accessPolicy, models })
    .setConfig(dataTable.config)
    .build();

  return dataTableService;
};
