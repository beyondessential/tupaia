/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { resourceToRecordType } from '../../utilities';
import { GETUserAccounts } from './GETUserAccounts';

export class GETUserForMe extends GETUserAccounts {
  constructor(req, res) {
    super(req, res);
    // "me" requests use the userId attached to the auth header as the record to find
    this.recordId = req.userId;
    this.recordType = resourceToRecordType('user');
    this.resourceModel = this.models.user;
  }

  // no assertion needed as "/me" endpoints are self enforcing - the user returned will be that
  // associated with the auth header
  async assertPermissions() {
    return super.assertPermissions(() => true);
  }
}
