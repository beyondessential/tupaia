/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebSubscribeDashboardRequest } from '@tupaia/types';
import { assertIsNotNullish } from '@tupaia/tsutils';

export type SubscribeDashboardRequest = Request<
  TupaiaWebSubscribeDashboardRequest.Params,
  TupaiaWebSubscribeDashboardRequest.ResBody,
  TupaiaWebSubscribeDashboardRequest.ReqBody,
  TupaiaWebSubscribeDashboardRequest.ReqQuery
>;

export class SubscribeDashboardRoute extends Route<SubscribeDashboardRequest> {
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

    const { email } = this.req.body;
    assertIsNotNullish(email);

    const dashboardMailingListEntry = {
      dashboard_mailing_list_id: dashboardMailingList.id,
      email,
      subscribed: true,
      unsubscribed_time: null,
    };

    const [entryResult] = await ctx.services.central.fetchResources('dashboardMailingListEntries', {
      filter: {
        dashboard_mailing_list_id: dashboardMailingList.id,
        email: this.req.body.email,
      },
    });

    if (entryResult) {
      await ctx.services.central.updateResource(
        `dashboardMailingListEntries/${entryResult.id}`,
        {},
        dashboardMailingListEntry,
      );
    } else {
      await ctx.services.central.createResource(
        `dashboardMailingListEntries`,
        {},
        dashboardMailingListEntry,
      );
    }

    const [upsertedEntry] = await ctx.services.central.fetchResources(
      'dashboardMailingListEntries',
      {
        filter: {
          dashboard_mailing_list_id: dashboardMailingList.id,
          email: this.req.body.email,
        },
      },
    );
    return upsertedEntry;
  }
}
