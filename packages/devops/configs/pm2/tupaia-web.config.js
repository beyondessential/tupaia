const { startDevConfigs } = require('./base.config');
const packages = require('../server-stacks.json')['tupaia-web'];

module.exports = {
  apps: startDevConfigs(packages),
};
