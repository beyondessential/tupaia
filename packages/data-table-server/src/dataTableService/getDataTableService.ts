import { Request } from 'express';
import { DataTable } from '@tupaia/types';
import { DataTableServiceBuilder, getDataTableServiceType } from './DataTableServiceBuilder';

export const getDataTableService = (dataTable: DataTable, req: Request<any, any, any, any>) => {
  const { accessPolicy, models, ctx } = req;

  const serviceType = getDataTableServiceType(dataTable);
  const dataTableService = new DataTableServiceBuilder()
    .setServiceType(serviceType)
    .setContext({ apiClient: ctx.services, accessPolicy, models })
    .setConfig(dataTable.config)
    .build();

  return dataTableService;
};
