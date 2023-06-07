/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { WebConfigApiInterface } from '..';

export class MockWebConfigApi implements WebConfigApiInterface {
  public fetchReport(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
