/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebUnsubscribeRequest } from '@tupaia/types';

export type UnsubscribeRequest = Request<
  TupaiaWebUnsubscribeRequest.Params,
  TupaiaWebUnsubscribeRequest.ResBody,
  TupaiaWebUnsubscribeRequest.ReqBody,
  TupaiaWebUnsubscribeRequest.ReqQuery
>;

export class UnsubscribeRoute extends Route<UnsubscribeRequest> {
  public async buildResponse() {
    const {
      ctx,
      params: { projectCode, entityCode, dashboardCode },
      session,
    } = this.req;

    if (!session) {
      throw new Error('User must be logged in to unsubscribe');
    }

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

    const [dashboardMailingListEntry] = await ctx.services.central.fetchResources(
      'dashboardMailingListEntries',
      {
        filter: {
          dashboard_mailing_list_id: dashboardMailingList.id,
          email: this.req.body.email,
        },
      },
    );

    if (!dashboardMailingListEntry) {
      throw new Error(
        `No mailing list entry found with requested email address for dashboard code '${dashboardCode}', at entity code '${entityCode}' for project with code '${projectCode}'`,
      );
    }

    const updatedEntry = await ctx.services.central.updateResource(
      `dashboardMailingListEntries/${dashboardMailingListEntry.id}`,
      {},
      {
        subscribed: false,
        unsubscribed_time: this.req.body.unsubscribeTime,
      },
    );

    return updatedEntry;
  }
}
