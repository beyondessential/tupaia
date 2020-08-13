/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export { mapAnalyticsToCountries } from './mapAnalyticsToCountries';
export { divideValues } from './divideValues';
export { subtractValues } from './subtractValues';
export { calculateArithmeticOperationForAnalytics } from './calculateArithmeticOperationForAnalytics';
export { groupEvents } from './groupEvents';
export { fetchComposedData } from './fetchComposedData';
export { addMetadataToEvents, isMetadataKey, metadataKeysToDataElementMap } from './eventMetadata';
export {
  checkValueSatisfiesCondition,
  getEventsThatSatisfyConditions,
  getAnalyticsThatSatisfyConditions,
  countAnalyticsThatSatisfyConditions,
  countEventsThatSatisfyConditions,
} from './checkAgainstConditions';
