/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { createDataTable } from '../dataTable';

export type FetchDataTableDataRequest = Request<
  { dataTableCode: string },
  { data: unknown[] },
  Record<string, unknown>,
  Record<string, unknown>
>;

export class FetchDataTableDataRoute extends Route<FetchDataTableDataRequest> {
  private async findDataTableObject() {
    const { models, params } = this.req;
    const { dataTableCode } = params;
    const dataTable = await models.dataTable.findOne({ code: dataTableCode });
    if (!dataTable) {
      throw new Error(`No data-table found with code ${dataTableCode}`);
    }

    return dataTable;
  }

  public async buildResponse() {
    const { body, accessPolicy, ctx } = this.req;

    const dataTableObject = await this.findDataTableObject();
    const permissionGroups = dataTableObject.permission_groups;

    if (!(permissionGroups.includes('*') || permissionGroups.some(accessPolicy.allowsAnywhere))) {
      throw new Error(`User does not have permission to access data table ${dataTableObject.code}`);
    }

    const dataTable = createDataTable(dataTableObject, ctx.services);

    const requestParams = { ...body };
    const data = await dataTable.fetchData(requestParams);
    return { data };
  }
}
