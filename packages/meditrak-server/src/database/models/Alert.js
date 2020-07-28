/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AlertModel as CommonAlertModel } from '@tupaia/database';

export class AlertModel extends CommonAlertModel {
  isDeletableViaApi = true;
}
