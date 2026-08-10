const { execSync } = require('node:child_process');
const path = require('node:path');

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

    ...(['web-config-server', 'report-server'].includes(packageName) && {
      exec_mode: 'cluster',
      /** As many replicas as cpu cores - 1  */
      instances: -1,
    }),

    /**
     * Some `Link` headers for from GET requests can be huge (over 24KiB) if they include a large
     * `filter` query parameter, which can be repeated several times over with different `page`s.
     * See `generateLinkHeader` from /packages/central-server/src/apiV2/GETHandler/helpers.js
     */
    ...(['central-server', 'tupaia-web-server'].includes(packageName) && {
      node_args: '--max-http-header-size=32768',
    }),
  })),
};
