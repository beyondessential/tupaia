/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { CommentModel as CommonCommentModel } from '@tupaia/database';

export class CommentModel extends CommonCommentModel {
  isDeletableViaApi = true;
}
