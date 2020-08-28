/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

export { historyMiddleware, reactToInitialState, initHistoryDispatcher } from './historyMiddleware';
export {
  createUrlString,
  getLocationComponentValue,
  getInitialLocation,
  getInitialLocationComponents,
} from './historyNavigation';
export { URL_COMPONENTS } from './constants';
