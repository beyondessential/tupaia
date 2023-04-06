FROM node:14.19.3-alpine3.15 as builder

# install features not available in base alpine distro
RUN apk --no-cache add bash

# set Yarn v3
RUN yarn set version berry

# set the workdir so that all following commands run within /tupaia
WORKDIR /tupaia

# get ready for dependencies to be installed via yarn, before copying the rest of the package, so
# that node_modules is built and added to the container cache without changes to code invalidating it
COPY package.json ./
COPY yarn.lock ./
COPY babel.config.json ./
COPY tsconfig-js.json ./
COPY jest.config-ts.json ./
COPY scripts/. ./scripts

COPY .yarn ./.yarn
COPY .yarnrc.yml ./


## copy *just the package.json* of each package so it is ready for yarn install, without adding the
## src directories, so that code changes don't invalidate the container cache before we've run yarn
## TODO: Only include internal deps needed by admin-panel-server
COPY packages/access-policy/package.json ./packages/access-policy/
COPY packages/admin-panel/package.json ./packages/admin-panel/
COPY packages/admin-panel-server/package.json ./packages/admin-panel-server/
COPY packages/aggregator/package.json ./packages/aggregator/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/auth/package.json ./packages/auth/
COPY packages/central-server/package.json ./packages/central-server/
COPY packages/data-api/package.json ./packages/data-api/
COPY packages/data-broker/package.json ./packages/data-broker/
COPY packages/data-lake-api/package.json ./packages/data-lake-api/
COPY packages/data-table-server/package.json ./packages/data-table-server/
COPY packages/database/package.json ./packages/database/
COPY packages/devops/package.json ./packages/devops/
COPY packages/dhis-api/package.json ./packages/dhis-api/
COPY packages/e2e/package.json ./packages/e2e/
COPY packages/entity-server/package.json ./packages/entity-server/
COPY packages/expression-parser/package.json ./packages/expression-parser/
COPY packages/indicators/package.json ./packages/indicators/
COPY packages/kobo-api/package.json ./packages/kobo-api/
COPY packages/superset-api/package.json ./packages/superset-api/
COPY packages/lesmis/package.json ./packages/lesmis/
COPY packages/lesmis-server/package.json ./packages/lesmis-server/
COPY packages/meditrak-app/package.json ./packages/meditrak-app/
COPY packages/meditrak-app-server/package.json ./packages/meditrak-app-server/
COPY packages/psss/package.json ./packages/psss/
COPY packages/psss-server/package.json ./packages/psss-server/
COPY packages/report-server/package.json ./packages/report-server/
COPY packages/server-boilerplate/package.json ./packages/server-boilerplate/
COPY packages/tsutils/package.json ./packages/tsutils/
COPY packages/types/package.json ./packages/types/
COPY packages/ui-components/package.json ./packages/ui-components/
COPY packages/utils/package.json ./packages/utils/
COPY packages/weather-api/package.json ./packages/weather-api/
COPY packages/web-config-server/package.json ./packages/web-config-server/
COPY packages/web-frontend/package.json ./packages/web-frontend/

# run yarn without building, so we can cache node_modules without code changes invalidating this layer
# TODO: Install tupaia/admin-panel-server AND its internal dependencies instead
# of the entire project ( yarn workspace @tupaia/admin-panel-server install etc..)
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn workspaces focus -A

## add content of all internal dependency packages ready for internal dependencies to be built
COPY packages/access-policy/. ./packages/access-policy
COPY packages/admin-panel/. ./packages/admin-panel
COPY packages/aggregator/. ./packages/aggregator
COPY packages/api-client/. ./packages/api-client
COPY packages/auth/. ./packages/auth
COPY packages/database/. ./packages/database
COPY packages/data-api/. ./packages/data-api
COPY packages/data-broker/. ./packages/data-broker
COPY packages/data-lake-api/. ./packages/data-lake-api
COPY packages/dhis-api/. ./packages/dhis-api
COPY packages/e2e/. ./packages/e2e
COPY packages/expression-parser/. ./packages/expression-parser
COPY packages/indicators/. ./packages/indicators
COPY packages/utils/. ./packages/utils
COPY packages/tsutils/. ./packages/tsutils
COPY packages/types/. ./packages/types
COPY packages/ui-components/. ./packages/ui-components
COPY packages/weather-api/. ./packages/weather-api
COPY packages/server-boilerplate/. ./packages/server-boilerplate
COPY packages/kobo-api/. ./packages/kobo-api
COPY packages/superset-api/. ./packages/superset-api
COPY ./tsconfig* ./


## build and install internal dependencies
# TODO: Only build required dependencies , passing --packagePath doesn't work
# as it doesn't recurse through deps as expected
RUN yarn build:internal-dependencies

# copy everything else from the repo
COPY . ./

## TODO: Only build required packages.. unfort. `workspaces foreach -vRt run build` fails with a dependency cycle.
RUN yarn build:non-internal-dependencies
