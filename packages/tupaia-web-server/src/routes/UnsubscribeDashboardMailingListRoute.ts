import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebUnsubscribeDashboardMailingListRequest } from '@tupaia/types';
import { verifyUnsubscribeToken } from '@tupaia/server-utils';
import { assertIsNotNullish } from '@tupaia/tsutils';

export type UnsubscribeDashboardMailingListRequest = Request<
  TupaiaWebUnsubscribeDashboardMailingListRequest.Params,
  TupaiaWebUnsubscribeDashboardMailingListRequest.ResBody,
  TupaiaWebUnsubscribeDashboardMailingListRequest.ReqBody,
  TupaiaWebUnsubscribeDashboardMailingListRequest.Query
>;

export class UnsubscribeDashboardMailingListRoute extends Route<UnsubscribeDashboardMailingListRequest> {
  public async buildResponse() {
    const {
      params: { mailingListId },
      query: { email, token },
      models,
    } = this.req;
    assertIsNotNullish(email);
    assertIsNotNullish(token);

    verifyUnsubscribeToken(token, email);

    await models.dashboardMailingListEntry.update(
      { email, dashboard_mailing_list_id: mailingListId, subscribed: true },
      { subscribed: false, unsubscribed_time: new Date() },
    );

    return { message: `Successfully unsubscribed from the mailing list` };
  }
}
