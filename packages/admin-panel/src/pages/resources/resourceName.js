/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export const capitalizeFirst = str => str[0].toUpperCase() + str.slice(1);

export const getPluralForm = ({ singular, plural }) => plural ?? `${singular}s`;

export const generateTitle = resourceName => capitalizeFirst(getPluralForm(resourceName));