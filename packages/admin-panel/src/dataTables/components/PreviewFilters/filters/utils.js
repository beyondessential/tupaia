/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const getArrayFieldValue = array => (array.length === 0 ? undefined : array);

export const getTextFieldValue = text => (text === '' || text === null ? undefined : text);
