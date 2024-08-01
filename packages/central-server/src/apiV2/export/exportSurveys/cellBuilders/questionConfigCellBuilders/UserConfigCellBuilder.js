/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from '../KeyValueCellBuilder';

export class UserConfigCellBuilder extends KeyValueCellBuilder {
  extractRelevantObject({ user }) {
    return user;
  }
}
