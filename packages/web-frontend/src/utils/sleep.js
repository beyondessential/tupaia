/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const sleep = (delay = 0) => {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
};
