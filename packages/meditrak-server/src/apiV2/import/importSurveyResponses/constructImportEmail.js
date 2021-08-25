/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getFailureMessage } from './getFailureMessage';

const constructFailuresMessage = failures => {
  const message = `Your survey responses have finished processing, but some were not able to be imported. Please fix the following and try again:
${failures.map(failure => `  - ${getFailureMessage(failure)}`).join('\n')}

Any responses not listed here have been successfully imported, and can be removed for your next attempt.`;
  return message;
};

const constructMessage = responseBody => {
  const { error, failures = [] } = responseBody;

  // global error, whole import has failed
  if (error) {
    return `Unfortunately, your survey response import failed.

${error}`;
  }

  // at least one response failed, but import finished processing
  if (failures.length > 0) {
    return constructFailuresMessage(failures);
  }

  return 'Your survey responses have been successfully imported.';
};

export const constructImportEmail = responseBody => {
  return { subject: 'Tupaia Survey Response Import', message: constructMessage(responseBody) };
};
