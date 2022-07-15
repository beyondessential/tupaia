/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { getUniqueViewId, getViewIdFromInfoViewKey } from '../../utils/getUniqueViewId';

describe('getUniqueViewId', () => {
  describe('getUniqueViewId()', () => {
    it('should generate id with valid input', () => {
      expect(getUniqueViewId('code_1', 21, 'hello')).toEqual('code_1___21___hello');
    });
  });

  describe('getViewIdFromInfoViewKey()', () => {
    it('should return null for undefined infoViewKey', () => {
      expect(getViewIdFromInfoViewKey(undefined)).toEqual(null);
    });

    it('should be able to select viewId from valid infoViewKey', () => {
      expect(getViewIdFromInfoViewKey('code_1___21___hello')).toEqual('hello');
    });
  });
});
