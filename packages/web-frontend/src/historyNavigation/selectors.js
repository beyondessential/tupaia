/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { getUrlComponent } from './historyNavigation';
import { URL_COMPONENTS } from './constants';

export const selectCurrentProjectCode = () => getUrlComponent(URL_COMPONENTS.PROJECT);

export const selectCurrentOrgUnitCode = () => getUrlComponent(URL_COMPONENTS.ORG_UNIT);
