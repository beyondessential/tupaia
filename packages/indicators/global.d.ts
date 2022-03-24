/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import 'jest-extended';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledOnceWith<E extends unknown[]>(...params: E): R;
      toBeRejectedWith(error?: string | Constructable | RegExp | Error): Promise<R>;
    }
  }
}
