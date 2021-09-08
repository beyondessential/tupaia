/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Index file that exports all utility functions that we use throughout tupaia_web
 */
export { default as request } from './request';
export { default as checkBoundsDifference } from './checkBoundsDifference';
export { organisationUnitIsArea } from './organisation';
export { isMobile, delayMobileTapCallback } from './mobile';
export { getCenterAndZoomForBounds } from './getCenterAndZoomForBounds';
export { getFacilityThumbnailUrl } from './getFacilityThumbnailUrl';
export { getMapUrl } from './getMapUrl';
export { OverlayContainer, OverlayView } from './overlayContainer';
export {
  processMeasureInfo,
  getMeasureDisplayInfo,
  getSingleFormattedValue,
  flattenNumericalMeasureData,
  flattenMeasureHierarchy,
  getMeasureFromHierarchy,
  isMeasureHierarchyEmpty,
} from './measures';
export { default as ga, gaEvent, gaPageView, gaMiddleware } from './ga';
export { formatDateForApi } from './formatDateForApi';
export { getBrowserTimeZone } from './getBrowserTimeZone';
export { formatDataValue } from './formatters';
export { findByKey } from './collection';
export { areStringsEqual } from './string';
export { hexToRgba, getPresentationOption, getInactiveColor } from './color';
export {
  getUniqueViewId,
  getViewIdFromInfoViewKey,
  getInfoFromInfoViewKey,
} from './getUniqueViewId';
export { sleep } from './sleep';
export { getLayeredOpacity } from './opacity';
