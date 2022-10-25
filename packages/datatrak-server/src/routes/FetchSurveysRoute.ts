/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchSurveysRequest = Request<
  Record<string, never>,
  Record<string, unknown>[],
  Record<string, never>
>;

const surveysEndpoint = 'surveys';

export class FetchSurveysRoute extends Route<FetchSurveysRequest> {
  public async buildResponse() {
    const { central: centralApi } = this.req.ctx.services;
    const surveyScreenComponents = await centralApi.fetchResources(surveysEndpoint);
    return surveyScreenComponents;
  }
}
