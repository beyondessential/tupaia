/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const { startDevConfigs } = require('./base.config');

module.exports = {
  apps: startDevConfigs([
    'central-server',
    'meditrak-app-server'
  ]),
};
