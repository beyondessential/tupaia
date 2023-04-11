FROM node:14.19.3-alpine3.15 as builder

# install features not available in base alpine distro
RUN apk --no-cache add bash && \
    yarn set version berry # set Yarn v3

# set the workdir so that all following commands run within /tupaia
WORKDIR /tupaia

# get ready for dependencies to be installed via yarn, before copying the rest of the package, so
# that node_modules is built and added to the container cache without changes to code invalidating it
COPY .yarnrc.yml package.json yarn.lock babel.config.json tsconfig-js.json jest.config-ts.json ./
COPY .yarn ./.yarn
COPY scripts ./scripts

## copy *just the package.json* of each package so it is ready for yarn install, without adding the
## src directories, so that code changes don't invalidate the container cache before we've run yarn
COPY packages/ pkgs/
RUN for pkg in $(ls pkgs); do if test -s pkgs/$pkg/package.json; then mkdir -p packages/$pkg && mv -v pkgs/$pkg/package.json packages/$pkg/; fi; done

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

# Build final production image
FROM node:14.19.3-alpine3.15 as dist
WORKDIR /tupaia

COPY --from=builder /tupaia/packages/ ./packages/
COPY --from=builder /tupaia/node_modules/ ./node_modules
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=1 yarn workspaces focus --all  --production

# Set workdir at runtime to specifiy service to start /tupaia/packages/<service>/
WORKDIR /tupaia/packages/central-server/
CMD ["node", "dist"]
