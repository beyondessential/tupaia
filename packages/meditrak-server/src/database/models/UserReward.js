/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
import { cache, CACHE_KEY_GENERATORS } from '../../utilities';

class UserRewardType extends DatabaseType {
  static databaseType = TYPES.USER_REWARD;
}

export class UserRewardModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserRewardType;
  }

  async getRewardsForUser(userId) {
    return cache.getOrElse(CACHE_KEY_GENERATORS.userRewards(userId), async () => {
      const rewardResults = await this.database.sum(this.databaseType, ['pigs', 'coconuts'], {
        user_id: userId,
      });
      const coconuts = rewardResults.coconuts || 0;
      const pigs = rewardResults.pigs || 0;

      return {
        coconuts: coconuts || 0,
        pigs: pigs + Math.floor(coconuts / 100), // Add a pig for every 100 coconuts.
      };
    });
  }

  /**
   * Gets a cached leaderboard.
   *
   * @returns array
   * [
   *   { user_id,
   *     first_name,
   *     last_name,
   *     coconuts,
   *     pigs,
   *   },...
   * ]
   */
  async getLeaderboard() {
    // Note: keep quotes in for SQL query.
    const userIdsToExclude = [
      "'59085f2dfc6a0715dae508e5'", // Edwin
      "'59085f80fc6a0715dae5144a'", // Kahlinda
      "'59a4f8faa0bcd70f2188d706'", // Lewis
      "'59a4f8faa0bcd70f2188d705'", // Susie
      "'59085f2dfc6a0715dae508e7'", // Michael
      "'5ab9c278820f656efb144377'", // Andrew
      "'59085f80fc6a0715dae51420'", // Gerry K
      "'5ea3984a61f76a61f1011fa7'", // Geoff F
      "'5cee0ba0f013d666713786a9'", // mSupply API Client
    ];
    return cache.getOrElse(CACHE_KEY_GENERATORS.leaderboard(), () =>
      this.database.executeSql(`
        SELECT r.user_id, user_account.first_name, user_account.last_name, r.coconuts, r.pigs
        FROM (
          SELECT user_id, SUM(coconuts) as coconuts, SUM(pigs) as pigs
          FROM user_reward
          WHERE user_id NOT IN (${userIdsToExclude.join(',')})
          GROUP BY user_id
        ) r
        JOIN user_account on user_account.id = r.user_id
        ORDER BY pigs DESC, coconuts DESC
      `),
    );
  }

  async resetUserRewardCacheForUser(userId) {
    return cache.unset(CACHE_KEY_GENERATORS.userRewards(userId));
  }
}
