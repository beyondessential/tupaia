/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const getSnakeCase = (value?: string) => {
  return value
    ?.split(/\.?(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};
