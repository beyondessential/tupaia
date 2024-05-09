/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const capitalizeFirst = str => str[0].toUpperCase() + str.slice(1);

export const generateTitle = ({ singular, irregularPlural }) =>
  capitalizeFirst(irregularPlural ?? `${singular}s`);
