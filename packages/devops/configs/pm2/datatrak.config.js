const { startDevConfigs } = require('./base.config');
const packages = require('../server-stacks.json').datatrak;

module.exports = {
  apps: startDevConfigs(packages),
};
