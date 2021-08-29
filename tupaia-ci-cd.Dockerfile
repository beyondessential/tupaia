FROM node:12.18.3-alpine3.11

# install features not available in base alpine distro
RUN apk --no-cache add \
  bash \
  curl \
  git \
  lastpass-cli \
  openssh \
  postgresql-client \
  rsync

# set the workdir so that all following commands run within /tupaia, which can then be copied
# to the common volume for use by other containers throughout the codeship steps
WORKDIR /tupaia

# get ready for dependencies to be installed via yarn, before copying the rest of the package, so
# that node_modules is built and added to the container cache without changes to code invalidating it
COPY package.json ./
COPY yarn.lock ./
COPY babel.config.json ./
COPY .babelrc-ts.js ./
COPY tsconfig-js.json ./
RUN mkdir ./scripts
COPY scripts/. ./scripts

RUN mkdir -p ./packages/devops/scripts/ci
COPY packages/devops/scripts/ci/makePlaceholderPackageFolders.sh ./packages/devops/scripts/ci

RUN ./packages/devops/scripts/ci/makePlaceholderPackageFolders.sh

## copy *just the package.json* of each package so it is ready for yarn install, without adding the
## src directories, so that code changes don't invalidate the container cache before we've run yarn
COPY packages/access-policy/package.json ./packages/access-policy
COPY packages/admin-panel/package.json ./packages/admin-panel
COPY packages/admin-panel-server/package.json ./packages/admin-panel-server
COPY packages/aggregator/package.json ./packages/aggregator
COPY packages/auth/package.json ./packages/auth
COPY packages/data-api/package.json ./packages/data-api
COPY packages/data-broker/package.json ./packages/data-broker
COPY packages/database/package.json ./packages/database
COPY packages/dhis-api/package.json ./packages/dhis-api
COPY packages/entity-server/package.json ./packages/entity-server
COPY packages/expression-parser/package.json ./packages/expression-parser
COPY packages/indicators/package.json ./packages/indicators
COPY packages/kobo-api/package.json ./packages/kobo-api
COPY packages/lesmis/package.json ./packages/lesmis
COPY packages/lesmis-server/package.json ./packages/lesmis-server
COPY packages/meditrak-server/package.json ./packages/meditrak-server
COPY packages/psss/package.json ./packages/psss
COPY packages/psss-server/package.json ./packages/psss-server
COPY packages/report-server/package.json ./packages/report-server
COPY packages/server-boilerplate/package.json ./packages/server-boilerplate
COPY packages/ui-components/package.json ./packages/ui-components
COPY packages/utils/package.json ./packages/utils
COPY packages/weather-api/package.json ./packages/weather-api
COPY packages/web-config-server/package.json ./packages/web-config-server
COPY packages/web-frontend/package.json ./packages/web-frontend

## run yarn without building internal dependencies, so we can cache that layer without code changes
## within internal dependencies invalidating it
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn install

## add content of all internal dependency packages ready for internal dependencies to be built
COPY packages/access-policy/. ./packages/access-policy
COPY packages/aggregator/. ./packages/aggregator
COPY packages/auth/. ./packages/auth
COPY packages/database/. ./packages/database
COPY packages/data-api/. ./packages/data-api
COPY packages/data-broker/. ./packages/data-broker
COPY packages/dhis-api/. ./packages/dhis-api
COPY packages/expression-parser/. ./packages/expression-parser
COPY packages/indicators/. ./packages/indicators
COPY packages/utils/. ./packages/utils
COPY packages/ui-components/. ./packages/ui-components
COPY packages/weather-api/. ./packages/weather-api
COPY packages/server-boilerplate/. ./packages/server-boilerplate
COPY packages/kobo-api/. ./packages/kobo-api

## build internal dependencies
RUN yarn build-internal-dependencies

# copy everything else from the repo
COPY . ./
