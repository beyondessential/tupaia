/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export { mapAnalyticsToCountries } from './mapAnalyticsToCountries';
export { divideValues } from './divideValues';
export { subtractValues } from './subtractValues';
export { calculateOperationForAnalytics } from './calculateOperationForAnalytics';
export { groupEvents, getAllDataElementCodes } from './groupEvents';
export { fetchComposedData } from './fetchComposedData';
export { addMetadataToEvents, isMetadataKey, metadataKeysToDataElementMap } from './eventMetadata';
export { composeDataByDataClass } from './composeDataByDataClass';
export {
  getEventsThatSatisfyConditions,
  getAnalyticsThatSatisfyConditions,
  countAnalyticsThatSatisfyConditions,
  countAnalyticsGroupsThatSatisfyConditions,
  countEventsThatSatisfyConditions,
} from './checkAgainstConditions';
export { uniqueValueFromEvents } from './uniqueValues';
