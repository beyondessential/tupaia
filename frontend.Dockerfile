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

# Trying to install just the dependencies for the frontend packages doesn't work as root level dev dependencies are needed for the build. I can't figure out a way to install just these deps.
RUN SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn workspaces focus -A

## Add content of all internal dependency packages ready for internal dependencies to be built
COPY packages/access-policy/. ./packages/access-policy
COPY packages/utils/. ./packages/utils
COPY packages/tsutils/. ./packages/tsutils
COPY packages/types/. ./packages/types
COPY packages/ui-components/. ./packages/ui-components
COPY scripts/bash/ ./scripts/bash/

#  Build tooling configuration files
COPY ./tsconfig* babel.config.json tsconfig-js.json jest.config-ts.json .eslintrc ./

# Build and install internal dependencies
RUN scripts/bash/buildInternalDependencies.sh --packagePath packages/web-frontend
RUN scripts/bash/buildInternalDependencies.sh --packagePath packages/admin-panel
RUN scripts/bash/buildInternalDependencies.sh --packagePath packages/psss

# Build the frontends
COPY packages/web-frontend packages/web-frontend
COPY packages/admin-panel packages/admin-panel
COPY packages/psss packages/psss

# Not using parrallel tasks (-P)  as node eats all the ram
RUN yarn workspaces foreach --verbose -j 1 --from '{@tupaia/psss,@tupaia/admin-panel,@tupaia/web-frontend}' run build

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
# copy .env files into package dirs prior to nginx startup
COPY scripts/docker/nginx/copy-env.sh /docker-entrypoint.d/50-copy-env.sh
# Use /home/ubuntu as workdir to be compatible with existing nginx config (packages/devops/configs/servers.conf)
WORKDIR "/home/ubuntu/tupaia"
COPY packages/devops/misc/error_page.html ./error_page.html
COPY --from=builder /tupaia/packages/web-frontend/build ./packages/web-frontend/build
COPY --from=builder /tupaia/packages/admin-panel/build ./packages/admin-panel/build
COPY --from=builder /tupaia/packages/psss/build ./packages/psss/build
