/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebSubscribeRequest } from '@tupaia/types';

export type SubscribeRequest = Request<
  TupaiaWebSubscribeRequest.Params,
  TupaiaWebSubscribeRequest.ResBody,
  TupaiaWebSubscribeRequest.ReqBody,
  TupaiaWebSubscribeRequest.ReqQuery
>;

export class SubscribeRoute extends Route<SubscribeRequest> {
  public async buildResponse() {
    const {
      ctx,
      params: { projectCode, entityCode, dashboardCode },
    } = this.req;

    const [dashboard] = await ctx.services.central.fetchResources('dashboards', {
      filter: {
        code: dashboardCode,
      },
    });
    const [project] = await ctx.services.central.fetchResources('projects', {
      filter: {
        code: projectCode,
      },
    });

    const entity = await ctx.services.entity.getEntity(projectCode, entityCode);

    const [dashboardMailingList] = await ctx.services.central.fetchResources(
      'dashboardMailingLists',
      {
        filter: {
          project_id: project.id,
          entity_id: entity.id,
          dashboard_id: dashboard.id,
        },
      },
    );
    if (!dashboardMailingList) {
      throw new Error(
        `No mailing list found for dashboard code '${dashboardCode}', at entity code '${entityCode}' for project with code '${projectCode}'`,
      );
    }

    const dashboardMailingListEntry = {
      dashboard_mailing_list_id: dashboardMailingList.id,
      email: this.req.body.email,
      subscribed: true,
      unsubscribed_time: null,
    };

    const upsertedEntry = ctx.services.central.upsertResource(
      'dashboardMailingListEntries',
      {
        filter: {
          dashboard_mailing_list_id: dashboardMailingList.id,
          email: this.req.body.email,
        },
      },
      dashboardMailingListEntry,
    );

    return upsertedEntry;
  }
}
