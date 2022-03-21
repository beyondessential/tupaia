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
  organisationUnitCodes: [hasContent, constructEveryItem(isAString)],
  startDate: [constructIsEmptyOr(takesDateForm)],
  endDate: [constructIsEmptyOr(takesDateForm)],
};

const ANALYTIC_OPTIONS = {
  dataElementCodes: [hasContent, constructEveryItem(isAString)],
};

const EVENT_OPTIONS = {
  dataElementCodes: [constructIsEmptyOr(constructEveryItem(isAString))],
  dataGroupCode: [hasContent, isAString],
  eventId: [constructIsEmptyOr(takesIdForm)],
};

export const validateEventOptions = async (options: Record<string, unknown>) => {
  if (!options) {
    throw new Error('Please provide options when fetching events');
  }
  const validator = new ObjectValidator({ ...COMMON_OPTIONS, ...EVENT_OPTIONS });
  return validator.validate(options);
};

export const validateAnalyticsOptions = async (options: Record<string, unknown>) => {
  if (!options) {
    throw new Error('Please provide options when fetching analytics');
  }
  const validator = new ObjectValidator({ ...COMMON_OPTIONS, ...ANALYTIC_OPTIONS });
  return validator.validate(options);
};
