/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const config = require('../../babel.config.json');

if (!config.presets) {
  config.presets = [];
}
config.presets.push('react-app');

module.exports = config;
