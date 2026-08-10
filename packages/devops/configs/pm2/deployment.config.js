/**
 * PM2 ecosystem config for deployed (EC2) instances.
 *
 * Used by /packages/devops/scripts/deployment-common/startBackEnds.sh, which starts each app
 * individually (`pm2 start deployment.config.js --only <package>`) as parallel background jobs.
 * PM2 serializes app starts when `wait_ready` is true, so starting the whole file with a single
 * `pm2 start` would boot the servers one at a time.
 */

const { execSync } = require('child_process');
const path = require('path');

const tupaiaDir = path.resolve(__dirname, '../../../..');

const backendPackages = execSync(path.join(tupaiaDir, 'scripts/bash/getDeployablePackages.sh'), {
  encoding: 'utf-8',
})
  .split('\n')
  .filter(packageName => packageName.endsWith('-server'));

module.exports = {
  apps: backendPackages.map(packageName => ({
    name: packageName,
    script: path.join(tupaiaDir, 'packages', packageName, 'dist'),
    wait_ready: true,
    listen_timeout: 15000,
    time: true,

    // As many replicas as cpu cores - 1
    ...(['web-config-server', 'report-server'].includes(packageName) && {
      exec_mode: 'cluster',
      instances: -1,
    }),

    // Some `Link` headers for from GET requests can be huge (over 24KiB) if they include a large
    // `filter` query parameter, which can be repeated several times over with different `page`s.
    // See `generateLinkHeader` from /packages/central-server/src/apiV2/GETHandler/helpers.js
    ...(['central-server', 'tupaia-web-server'].includes(packageName) && {
      node_args: '--max-http-header-size=32768',
    }),
  })),
};
