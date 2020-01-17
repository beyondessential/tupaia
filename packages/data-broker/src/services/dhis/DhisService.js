/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataService } from '../DataService';
import { getDhisApiInstance } from './getDhisApiInstance';

export class DhisService extends DataService {
  constructor(serverName) {
    super();
    this.api = getDhisApiInstance({ serverName });
  }
}
