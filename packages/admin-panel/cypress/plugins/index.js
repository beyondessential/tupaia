/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const cypressDotenv = require('cypress-dotenv');

module.exports = (on, config) => cypressDotenv(config);
