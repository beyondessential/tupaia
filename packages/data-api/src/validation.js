/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  ObjectValidator,
  isAString,
  hasContent,
  constructEveryItem,
  constructIsEmptyOr,
  takesDateForm,
  takesIdForm,
} from '@tupaia/utils';

const COMMON_OPTIONS = {
  dataElementCodes: [hasContent, constructEveryItem(isAString)],
  organisationUnitCodes: [hasContent, constructEveryItem(isAString)],
  startDate: [constructIsEmptyOr(takesDateForm)],
  endDate: [constructIsEmptyOr(takesDateForm)],
};

const EVENT_OPTIONS = {
  surveyCode: [hasContent, isAString],
  eventId: [constructIsEmptyOr(takesIdForm)],
};

export const validateEventOptions = async options => {
  if (!options) {
    throw new Error('Please provide options when fetching events');
  }
  const validator = new ObjectValidator({
    ...COMMON_OPTIONS,
    ...EVENT_OPTIONS,
  });
  return validator.validate(options);
};

export const validateAnalyticsOptions = async options => {
  if (!options) {
    throw new Error('Please provide options when fetching analytics');
  }
  const validator = new ObjectValidator(COMMON_OPTIONS);
  return validator.validate(options);
};
