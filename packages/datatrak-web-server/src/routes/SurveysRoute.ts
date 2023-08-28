/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebSurveysRequest } from '@tupaia/types';

export type SurveysRequest = Request<
  DatatrakWebSurveysRequest.Params,
  DatatrakWebSurveysRequest.ResBody,
  DatatrakWebSurveysRequest.ReqBody,
  DatatrakWebSurveysRequest.ReqQuery
>;

export class SurveysRoute extends Route<SurveysRequest> {
  public async buildResponse() {
    const { ctx, query = {} } = this.req;
    const { fields } = query;
    const surveys = await ctx.services.central.fetchResources('surveys', {
      columns: fields,
    });
    return camelcaseKeys(surveys, { deep: true });
  }
}
