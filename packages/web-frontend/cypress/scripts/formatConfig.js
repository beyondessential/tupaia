#!/usr/bin/env node

import path from 'path';

import {
  getLoggerInstance,
  getNestedFiles,
  readJsonFile,
  orderBy,
  writeJsonFile,
  runScriptSync,
} from '@tupaia/utils';

const CONFIG_ROOT = path.resolve(`${__dirname}/../config`);

const formatConfig = () => {
  const logger = getLoggerInstance();

  const configFiles = getNestedFiles(CONFIG_ROOT, { extensions: ['.json'] });
  logger.info(`Found ${configFiles.length} .json files under ${CONFIG_ROOT}, formatting...`);
  configFiles.forEach(filePath => {
    const config = readJsonFile(filePath);
    const sortedConfig = orderBy(config, ['id', 'code']);
    writeJsonFile(filePath, sortedConfig);
  });
};

runScriptSync(formatConfig);
