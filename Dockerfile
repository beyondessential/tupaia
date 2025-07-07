FROM node:14.19.3-alpine3.15 as base

# Install features not available in base alpine distro
RUN apk --no-cache add bash && \
    yarn set version berry # set Yarn v3

# Copy *just the package.json* of each package in a separate stage so we don't cachebust it
WORKDIR /pre
FROM base as yarnprep
COPY .yarnrc.yml package.json yarn.lock ./
COPY packages/ pkgs/
RUN for pkg in $(ls pkgs); do if test -s pkgs/$pkg/package.json; then mkdir -p packages/$pkg && mv -v pkgs/$pkg/package.json packages/$pkg/; fi; done


FROM base as builder
WORKDIR /tupaia
COPY --from=yarnprep /pre/package.json /pre/yarn.lock /pre/.yarnrc.yml ./
COPY .yarn ./.yarn
COPY --from=yarnprep /pre/packages/ ./packages
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn workspaces focus -A

## Add content of all internal dependency packages ready for internal dependencies to be built
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
COPY packages/ui-chart-components/. ./packages/ui-chart-components
COPY packages/ui-map-components/. ./packages/ui-map-components
COPY packages/weather-api/. ./packages/weather-api
COPY packages/server-boilerplate/. ./packages/server-boilerplate
COPY packages/kobo-api/. ./packages/kobo-api
COPY packages/superset-api/. ./packages/superset-api
COPY scripts/bash/ ./scripts/bash/

#  Build tooling configuration files
COPY ./tsconfig* vite.config.js moduleMock.js babel.config.json tsconfig-js.json jest.config-ts.json .eslintrc ./

# Build and install internal dependencies
RUN yarn build:internal-dependencies

COPY packages/ packages/

RUN yarn build:non-internal-dependencies

# Build final production image
FROM node:14.19.3-alpine3.15 as dist
WORKDIR /tupaia

COPY --from=builder /tupaia/packages/ ./packages/
COPY --from=builder /tupaia/node_modules/ ./node_modules
# TODO: Remove dev dependencies here. Running yarn workspaces focus -A
# --production doesn't work - it removes deps required at runtime !

# Set workdir at to specifiy service to start
WORKDIR /tupaia/packages/central-server
CMD ["node", "dist"]
