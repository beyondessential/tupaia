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
# Run yarn without building, so we can cache node_modules without code changes invalidating this layer
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn workspaces focus -A

## Add content of all internal dependency packages ready for internal dependencies to be built
COPY packages/utils/. ./packages/utils
COPY packages/tsutils/. ./packages/tsutils
COPY packages/types/. ./packages/types
COPY packages/ui-components/. ./packages/ui-components
COPY scripts/bash/ ./scripts/bash/

#  Build tooling configuration files
COPY ./tsconfig* babel.config.json tsconfig-js.json jest.config-ts.json .eslintrc ./

# Build and install internal dependencies
RUN scripts/bash/buildInternalDependencies.sh --packagePath packages/web-frontend


COPY packages/web-frontend packages/web-frontend

RUN yarn build:web-frontend


FROM docker.io/bitnami/git:2.40.1 as h5bp
# add h5bp config
RUN git clone https://github.com/h5bp/server-configs-nginx.git && \
    cd ./server-configs-nginx && \
    git checkout tags/2.0.0

# Build final production image
FROM nginx:1.24.0-alpine3.17
WORKDIR /home/ubuntu/tupaia

# COPY packages/devops/configs/nginx.conf /etc/nginx/nginx.conf
COPY packages/devops/configs/servers.conf /etc/nginx/conf.d/servers.conf
COPY --from=h5bp server-configs-nginx/h5bp /etc/nginx/h5bp

WORKDIR "/home/ubuntu/tupaia"
COPY packages/devops/misc/error_page.html ./error_page.html
COPY --from=builder /tupaia/packages/web-frontend/build ./packages/web-frontend/build
