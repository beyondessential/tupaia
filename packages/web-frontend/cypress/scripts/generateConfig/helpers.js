/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';

export const readJsonFile = path => JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));

export const writeJsonFile = (path, json) => fs.writeFileSync(path, JSON.stringify(json, null, 2));
