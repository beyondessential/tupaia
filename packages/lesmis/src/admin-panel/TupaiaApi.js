/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApi as AdminPanelApi } from '@tupaia/admin-panel/lib';
import { getApiUrl } from '../utils/getApiUrl';

export class TupaiaApi extends AdminPanelApi {
  constructor() {
    super();

    // set env variables
    this.apiUrl = getApiUrl();
    this.clientBasicAuthHeader = process.env.REACT_APP_CLIENT_BASIC_AUTH_HEADER;
  }
}
