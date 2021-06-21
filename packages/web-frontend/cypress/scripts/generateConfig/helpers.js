/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import { uniq } from 'lodash';

import { compareAsc } from '@tupaia/utils';

export const readJsonFile = path => JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));

export const writeJsonFile = (path, json) => fs.writeFileSync(path, JSON.stringify(json, null, 2));

export const validateFilter = (filter, allowedKeys) =>
  Object.keys(filter).forEach(key => {
    if (!allowedKeys.includes(key)) {
      throw new Error(`Key "${key}" is not a valid filter key`);
    }
  });

export const buildUrlsUsingConfig = async (db, config, generateUrls) => {
  const { urlFiles = [], urls = [], urlGenerationOptions = {} } = config;
  const urlsFromFiles = urlFiles.map(readJsonFile).flat();
  const generatedUrls = generateUrls ? await generateUrls(db, urlGenerationOptions) : [];

  return [...urlsFromFiles, ...urls, ...generatedUrls];
};

export const sortUrls = urls => uniq(urls).sort(compareAsc);
