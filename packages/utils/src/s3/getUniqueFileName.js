/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const getRandomInteger = () => Math.floor(Math.random() * 1000000 + 1);

export function getUniqueFileName(originalName = '') {
  return `${Date.now()}_${getRandomInteger()}_${originalName}`;
}
