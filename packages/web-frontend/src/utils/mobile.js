/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

// Timeout in order to show button press effects on user actions before screen refreshes.
const TOUCH_EFFECT_TIME = 100;
export const delayMobileTapCallback = callback => setTimeout(() => callback(), TOUCH_EFFECT_TIME);

export const isMobile = () => process.env.REACT_APP_APP_TYPE === 'mobile';
