const { startDevConfigs } = require('./base.config');
const packages = require('../server-stacks.json')['viz-test-tool'];

module.exports = {
  apps: startDevConfigs(packages),
};
