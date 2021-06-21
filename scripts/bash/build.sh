#!/bin/bash

# TODO: replace with `yarn workspaces foreach -pt run build` after upgrading to yarn v2

yarn workspace @tupaia/access-policy build
yarn workspace @tupaia/admin-panel build
yarn workspace @tupaia/aggregator build
yarn workspace @tupaia/auth build
yarn workspace @tupaia/data-api build
yarn workspace @tupaia/data-broker build
yarn workspace @tupaia/database build
yarn workspace @tupaia/datatrak-app build
yarn workspace @tupaia/devops build
yarn workspace @tupaia/dhis-api build
yarn workspace @tupaia/entity-server build
yarn workspace @tupaia/expression-parser build
yarn workspace @tupaia/indicators build
yarn workspace @tupaia/lesmis build
yarn workspace @tupaia/lesmis-server build
yarn workspace @tupaia/meditrak-app build
yarn workspace @tupaia/meditrak-server build
yarn workspace @tupaia/psss build
yarn workspace @tupaia/psss-server build
yarn workspace @tupaia/report-server build
yarn workspace @tupaia/server-boilerplate build
yarn workspace @tupaia/ui-components build
yarn workspace @tupaia/utils build
yarn workspace @tupaia/weather-api build
yarn workspace @tupaia/web-config-server build
yarn workspace @tupaia/web-frontend build