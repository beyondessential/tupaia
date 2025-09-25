import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type UserRewardsRequest = Request<Record<string, never>, { coconuts: number; pigs: number }>;

export class UserRewardsRoute extends Route<UserRewardsRequest> {
  public async buildResponse() {
    const { user, models } = this.req;

    if (!user) {
      throw new Error('No user attached to request');
    }

    const { id: userId } = user;

    const [{ coconuts, pigs }] = await models.database.executeSql<
      { coconuts: number; pigs: number }[]
    >(
      // The COUNT(*)::int is required here, since pg serializes count to string
      // (https://stackoverflow.com/questions/47843370/postgres-sequelize-raw-query-to-get-count-returns-string-value)
      `
        SELECT user_id, COUNT(*)::int as coconuts, FLOOR(COUNT(*) / 100)::int as pigs
        FROM survey_response
        WHERE user_id = ?
        GROUP BY user_id;
        `,
      [userId],
    );

    return { coconuts, pigs };
  }
}
