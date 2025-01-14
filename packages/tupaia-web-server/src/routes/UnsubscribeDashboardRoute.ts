import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebUnsubscribeDashboardRequest } from '@tupaia/types';
import { assertIsNotNullish } from '@tupaia/tsutils';

export type UnsubscribeDashboardRequest = Request<
  TupaiaWebUnsubscribeDashboardRequest.Params,
  TupaiaWebUnsubscribeDashboardRequest.ResBody,
  TupaiaWebUnsubscribeDashboardRequest.ReqBody,
  TupaiaWebUnsubscribeDashboardRequest.ReqQuery
>;

export class UnsubscribeDashboardRoute extends Route<UnsubscribeDashboardRequest> {
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

    const { email, unsubscribeTime } = this.req.body;
    assertIsNotNullish(email);
    assertIsNotNullish(unsubscribeTime);

    const [dashboardMailingListEntry] = await ctx.services.central.fetchResources(
      'dashboardMailingListEntries',
      {
        filter: {
          dashboard_mailing_list_id: dashboardMailingList.id,
          email,
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
        unsubscribed_time: unsubscribeTime,
      },
    );

    return updatedEntry;
  }
}
