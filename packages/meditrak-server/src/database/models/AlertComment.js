/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AlertCommentModel as CommonAlertCommentModel } from '@tupaia/database';

export class AlertCommentModel extends CommonAlertCommentModel {
  isDeletableViaApi = true;
}
