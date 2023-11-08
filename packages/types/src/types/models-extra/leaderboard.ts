/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { UserAccount } from '../models';

export type LeaderboardItem = {
  user_id: UserAccount['id'];
  first_name: UserAccount['first_name'];
  last_name: UserAccount['last_name'];
  coconuts: number;
  pigs: number;
};
