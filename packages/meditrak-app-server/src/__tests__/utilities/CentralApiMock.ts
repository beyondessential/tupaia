/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

export class CentralApiMock {
  public async registerUserAccount(userFields: Record<string, unknown>) {
    return { message: 'Successfully created user', id: userFields.id };
  }
}
